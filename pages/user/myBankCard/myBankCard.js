// pages/user/myBankCard/myBankCard.js
const App = getApp()
import {
  $yjpToast
} from '../../../components/yjp.js'
const api = require('../../../utils/NetWorkUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bankCard: ``,
    bankCardArr: [],
    isEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    console.log(options)
    // this.change_card("3265986532146598")
    let access_token = wx.getStorageSync(`access_token`)
    const userInfo = wx.getStorageSync(`userInfo`)
    this.setData({
      access_token,
      userInfo

    })
    this.getBankCardList()

  },
  onLoad(options) {
    let pageType = options.pageType ? options.pageType : ''
    this.setData({
      pageType
    })
  },
  //获取银行卡列表
  getBankCardList() {
    let {
      access_token
    } = this.data
    let that = this
    api._get(`api/v1/user/bankCards`, {
      access_token
    }).then(data => {
      if (data.code == 0) {
        if (!data.data || !data.data.length) {
          that.setData({
            bankCardArr: [],
            isEmpty: true
          })
        } else {
          data.data.forEach(item => {
            item.accountNo1 = item.accountNo 
            item.accountNo = this.change_card(item.accountNo)
            
          })
          that.setData({
            bankCardArr: data.data,
            isEmpty: false
          })
        }
      }
    })
  },

  //转换银行卡号格式
  change_card(card) {
    var data = "3265986532146598";
    // console.log(data.replace(/\s/g, '').replace(/(\d{4})\d+(\d{4})$/, "**** **** **** $2"))
    return card = data.replace(/\s/g, '').replace(/(\d{4})\d+(\d{4})$/, "**** **** **** $2")
    console.log(card.split(' ')) //如果要求星号的间距 就转换为数组形式 循环模式进行展示 然后再css设置样式
    // this.setData({
    //   bankCard: card
    // })
  },
  //添加银行卡
  addBankCard() {
    if (!this.data.userInfo.idCardStatus || this.data.userInfo.idCardStatus != 3 && this.data.userInfo.idCardStatus != 1 ) {
      wx.showModal({
        title: '提示',
        content: '您还没有实名认证，是否进行实名认证？',
        confirmText: '是',
        success(res) {
          if (res.confirm) {
            App.WxService.navigateTo(App.Constants.Route.identification)
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      App.WxService.navigateTo(App.Constants.Route.addBankCard)

    }
  },
  // 删除银行卡
  deleteBankCard(e) {
    let id = e.currentTarget.dataset.id
    let access_token = this.data.access_token
    let url = `api/v1/user/bankCard/${id}?access_token=${access_token}`
    let that = this
    wx.showModal({
      title: '提示',
      content: '您确定删除该银行卡吗？',
      success(res) {
        if (res.confirm) {
          api._delete(url).then(data => {
            if (data.code == 0) {
              $yjpToast.show({
                text: data.desc
              })
              that.getBankCardList()
            } else {
              $yjpToast.show({
                text: data.desc
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  selectBankCard(e){
    let cardInfo = e.currentTarget.dataset.cardInfo
    cardInfo.accountNo = cardInfo.accountNo.split(" ")[3]
    console.log(cardInfo)
    if (!this.data.pageType) {
      return
    }
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    // 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      bankCardInfo: cardInfo
    })
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    })
  },

})