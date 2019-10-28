// pages/shopCart/shopCart.js
const App = getApp()
const api = require('../../utils/NetWorkUtil.js')
import { $yjpToast } from '../../components/yjp.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopCartList: [],
    selectAllStatus: true, //全选状态 默认全选
    totalPrice: 0, //金额   总额    初始为0
    totalNumber: 0, //结算总数量 初始为0
    access_token: ``,
    selectIdArr: [],
    balanceStatus: false,
    isEmpty: false,
    // selectStatus:false
    memberId:``,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    let access_token = wx.getStorageSync(`access_token`)
    let memberId = wx.getStorageSync(`userInfo`).memberId

    this.setData({
      access_token,
      memberId
    })
    this.getShopCartList()
    this.count_price()
    this.total_number()

  },

  //获取购物车列表
  getShopCartList() {
    let {
      access_token
    } = this.data
    let url = `/api/v1/jc/mall/cart?access_token=${access_token}`
    api._get(url, {}).then(data => {
      let shopCartList = data.data.items
      let number = 0;
      shopCartList.forEach(item => {
        // item.select = true
        // number += item.count
      })
      if (!shopCartList || !shopCartList.length) {
        this.setData({ isEmpty: true,totalPrice:0,totalNumber:0,shopCartList:[], })
      } else {
        this.setData({
          shopCartList: shopCartList,
          // totalPrice: data.data.total,
          selectAllStatus: true,
          // totalNumber: number,
          isEmpty: false
        })
      }

    })
  },
  // 当前商品选中事件
  selectList(e) {
    let that = this
    // let selectIdArr = this.data.selectIdArr
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.id
    let shopCartList = that.data.shopCartList
    let balanceStatus = this.data.balanceStatus
    this.setData({
      selectId:id
    })
    this.count_price()
    this.total_number()
    // TODO 全选暂时去掉
    // that.data.selectAllStatus = true //默认全选
    // //循环数组数据，判断选中---未选中[select]
    // shopCartList[index].select = !shopCartList[index].select;
    // // balanceStatus = !balanceStatus

    // //如果数组数据全部为select -- true  ，全选
    // for (let i = shopCartList.length - 1; i >= 0; i--) {
    //   if (!shopCartList[i].select) {
    //     that.data.selectAllStatus = false;
    //     break;
    //   }
    // }
    // // 重新渲染数据
    // that.setData({
    //   shopCartList: shopCartList,
    //   selectAllStatus: that.data.selectAllStatus,
    //   balanceStatus
    // })
    // this.count_price()
    // this.total_number()
  },
  selctProduct(){
    App.WxService.switchTab(App.Constants.Route.homePage)
  },

  // 计算总价
  count_price() {
    //获取列表数据
    let list = this.data.shopCartList
    let total = 0;
    list.forEach(item => {
      if (item.id==this.data.selectId) {
        total += item.count * item.price
      }
    })
    this.setData({
      shopCartList: list,
      totalPrice: total
    })
  },

  // 计算结算数量
  total_number() {
    let list = this.data.shopCartList
    let number = 0;
    list.forEach(item => {
      if (item.id==this.data.selectId) {
        number += item.count
      }
    })
    this.setData({
      shopCartList: list,
      totalNumber: number
    })
  },

  // 绑定减数量事件
  btn_reduce(e) {
    let goodsNo = e.currentTarget.dataset.goodsNo
    let access_token = this.data.access_token
    let index = e.currentTarget.dataset.index
    let list = this.data.shopCartList
    let num = list[index].count
    if (num <= 1) { //判断num小于等于1  return; 点击无效
      return false
    }
    let url = `api/v1/jc/mall/cart/item?access_token=${access_token}&goodsNo=${goodsNo}`
    api._delete(url, {
      access_token,
      goodsNo
    }).then(data => {
      console.log(data)
      num = num - 1
      list[index].count = num
      // 渲染页面
      this.setData({
        shopCartList: list
      })
      this.getShopCartList()
    })

    // this.count_price();
    // this.total_number()
  },
  //绑定加数量事件
  btn_add(e) {
    let that = this
    let goodsNo = e.currentTarget.dataset.goodsNo
    let access_token = this.data.access_token
    let index = e.currentTarget.dataset.index
    let list = this.data.shopCartList
    let num = list[index].count
    let url = `api/v1/jc/mall/cart/item?access_token=${access_token}&goodsNo=${goodsNo}`
    api._post(url, {
      access_token,
      goodsNo
    }).then(data => {
      list[index].count = data.data.count
      that.setData({
        shopCartList: list
      })
      that.getShopCartList()
    })

    // this.count_price()
    // this.total_number()
  },
  // 购物车全选事件
  selectAll() {
    let {
      selectAllStatus,
      balanceStatus
    } = this.data
    selectAllStatus = !selectAllStatus
    // balanceStatus = !balanceStatus
    let list = this.data.shopCartList
    var arr = [];
    list.forEach(item => {
      item.select = selectAllStatus
      // balanceStatus = !selectAllStatus
    })
    this.setData({
      selectAllStatus,
      shopCartList: list,
      balanceStatus
    })
    this.count_price()
    this.total_number()
  },
  // 删除商品事件
  deleteProduct(e) {
    let that = this
    let itemId = e.currentTarget.dataset.itemId
    let list = this.data.shopCartList
    let access_token = this.data.access_token
    let url = `api/v1/jc/mall/cart/items?access_token=${access_token}&itemId=${itemId}`
    wx.showModal({
      title: '提示',
      content: '确定删除吗',
      success(res) {
        if (res.confirm) {
          api._delete(url, {
            itemId,
            access_token
          }).then(data => {
            if (data.code == 0) {
              $yjpToast.show({
                text: `删除成功`
              })
              that.getShopCartList();
              // that.count_price();
              // that.total_number()
            } else {
              $yjpToast.show({
                text: `删除失败`
              })
            }
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },


  // 去结算
  balance(e) {
    let {
      shopCartList,
      totalNumber,
      totalPrice,
      selectId
    } = this.data
    let arr = []
    let productList = []
    let pageType = e.currentTarget.dataset.pageType
    shopCartList.forEach(item => {
      if (item.id==selectId) {
        arr.push(item.id)
        productList.push(item)
      }
    })
    this.setData({
      selectIdArr: arr
    })
    console.log(productList)
    if (!this.data.selectIdArr || !this.data.selectIdArr.length) {
      $yjpToast.show({
        text: `您还未选择需要结算的商品`
      })
      return
    }
    console.log(this.data.selectIdArr)
    App.WxService.navigateTo(App.Constants.Route.placeOrder, {
      productList,
      selectIdArr: this.data.selectIdArr,
      pageType,
      count: totalNumber,
      totalPrice
    })
  },
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '骏驰',
      path: `/pages/homePage/homePage?scene=inviter%3D${this.data.memberId}`,
      imageUrl: `/assets/image/share2.png`
    }
  },
})