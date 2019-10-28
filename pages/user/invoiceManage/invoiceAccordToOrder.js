// pages/user/invoiceManage/invoiceAccordToOrder.js
const App = getApp()
const api = require('../../../utils/NetWorkUtil')
import {$yjpToast} from '../../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    selectAllStatus: true, //全选状态 默认全选
    // totalPrice: 0, //金额   总额    初始为0
    // totalNumber: 0, //结算总数量 初始为0
    page:1,
    size:10,
    windowHeight:0,
    isEmpty:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    let access_token = wx.getStorageSync(`access_token`)
    const systemInfo = App.globalData.systemInfo;
    let titleHeight = systemInfo.windowWidth / 750 * 40;
    this.setData({ access_token, windowHeight: systemInfo.windowHeight - titleHeight, page: 1, orderList:[]})
    this.getOrderList(access_token)
  },
  //获取列表
  getOrderList(access_token){
    let {page,size,orderList} = this.data
    wx.showLoading({
      title: '加载中'
    })
    api._get(`api/v1/jc/mall/order/list`, { page, size, access_token, invoiceStatus: 'NO', status:"FINISH"}).then(data=>{
      console.log(data)
      if ((!data.data || !data.data.length) && page == 1) {
        this.setData({
          orderList: [],
          isEmpty: true
        })
      } else if ((!data.data || !data.data.length) && page != 1) {
        $yjpToast.show({
          text: `没有更多数据了`
        })
      } else {
        let oldArr = orderList
        let newArr = data.data
        let finaArr = oldArr.concat(newArr)
        finaArr.filter(item=>{
          item.select = true
        })
        finaArr.forEach(item => {
          item.expireIn = this.sec_to_time(item.expireIn)

        })
        this.setData({
          orderList: finaArr,
          page: ++page
        })
        console.log(finaArr)
      }
      wx.hideLoading()
    })
  },
  /**
   * 时间秒数格式化
   * @param s 时间戳（单位：秒）
   * @returns {*} 格式化后的时分秒
   */
  sec_to_time(s) {
    var t;
    if (s > -1) {
      var hour = Math.floor(s / 3600);
      var min = Math.floor(s / 60) % 60;
      var sec = s % 60;
      if (hour < 10) {
        t = '0' + hour + ":";
      } else {
        t = hour + ":";
      }

      if (min < 10) {
        t += "0";
      }
      t += min + ":";
      if (sec < 10) {
        t += "0";
      }
      t += sec
    }
    return t;
  },
  lower() {
    let access_token = this.data.access_token
    this.getOrderList(access_token)
  },

  // 当前商品选中事件

  selectList(e) {
    let that = this
    let orderNo = e.currentTarget.dataset.orderNo
    let price = e.currentTarget.dataset.price
    this.setData({selectNo:orderNo,price})
  },

//下一步
  nextStep(){
    let orderNo = this.data.selectNo
    let price = this.data.price
    console.log(orderNo)
    if(!orderNo){
      $yjpToast.show({text:`请选择开具发票的订单`})
      return
    }
    App.WxService.navigateTo(App.Constants.Route.invoicing, { orderNo, price})
  },
  onPullDownRefresh() {
    wx.setNavigationBarTitle({
      title: '刷新中……'
    }) //动态设置当前页面的标题。
    let access_token = this.data.access_token
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
    this.data.page = 1
    this.data.orderList = []
    this.getOrderList(access_token); //重新加载产品信息

    wx.hideNavigationBarLoading(); //隐藏导航条加载动画。

    wx.stopPullDownRefresh(); //停止当前页面下拉刷新。

    console.log("关闭");

    wx.setNavigationBarTitle({
      title: '根据订单开具发票'
    }) //动态设置当前页面的标题。
  },
  onReachBottom() {
    wx.showNavigationBarLoading();
    let access_token = this.data.access_token
    this.getOrderList(access_token)
  },
  // chooseInvoiceTitle() {
  //   wx.chooseInvoiceTitle({
  //     success: (res) => {
  //       console.log(res)
  //       this.setData({
  //       })
  //     },
  //     fail: (err) => {
  //       console.error(err)
  //     }
  //   })
  // }
})