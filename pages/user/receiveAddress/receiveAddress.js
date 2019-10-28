// pages/user/receiveAddress/receiveAddress.js
import {
  $yjpToast
} from '../../../components/yjp.js'
const api = require('../../../utils/NetWorkUtil.js')
const App = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    access_token: ``,
    memberId: ``, //会员ID
    addressList: [],
    isEmpty:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let access_token = wx.getStorageSync(`access_token`)
    let memberId = wx.getStorageSync(`userInfo`).memberId
    let pageType = options.pageType?options.pageType:''
    console.log(memberId)
    this.setData({
      access_token,
      memberId,
      pageType
    })
    this.getReceiveAddressList()

  },
  onShow() {
    this.getReceiveAddressList()
  },
  //获取收货地址列表
  getReceiveAddressList() {
    let {
      access_token,
      memberId
    } = this.data
    let url = `api/v1/user/${memberId}/deliveryAddress`
    api._get(url, {
      access_token
    }).then(data => {
      if(!data.data||data.data.length==0){
        this.setData({
          addressList: [],
          isEmpty:true
          
        })
      }else {
        this.setData({
          addressList: data.data,
          isEmpty:false
        })
      }
     
    })

  },
  addReceiveAddress(e) {
    const tag = e.currentTarget.dataset.tag
    const pageType = e.currentTarget.dataset.pageType
    console.log(pageType)
    App.WxService.navigateTo(App.Constants.Route[tag], {
      pageType
    })
  },
  edit(e) {
    const tag = e.currentTarget.dataset.tag
    const pageType = e.currentTarget.dataset.pageType
    const address = e.currentTarget.dataset.address
    App.WxService.navigateTo(App.Constants.Route[tag], {
      pageType,
      address
    })
  },
  // 删除
  deleteAddress(e) {
    let deliveryAddressId = e.currentTarget.dataset.id
    let that = this
    let {
      access_token,
      memberId,
      addressList
    } = this.data
    let url = `api/v1/user/${memberId}/deliveryAddress/${deliveryAddressId}?access_token=${access_token}`
    wx.showModal({
      title: '提示',
      content: '确定删除该地址吗？',
      success(res) {
        if (res.confirm) {
          api._delete(url, {
            access_token
          }).then(data => {
            if (data.code == 0) {
              $yjpToast.show({
                text: `删除成功`
              })
              that.getReceiveAddressList();
            }
          })
        } else if (res.cancel) {}
      }
    })

  },
  // 选择地址
  selectAddress(e){
    let addressInfo = e.currentTarget.dataset.addressInfo
    if(this.data.pageType){
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1];  //当前页面
      var prevPage = pages[pages.length - 2]; //上一个页面
      // 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        addressInfo: addressInfo,
        userPhone: addressInfo.receiverMobile
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        });
      })
    }
  },
})