// pages/product/evaluateList.js
const App = getApp()
const api = require('../../utils/NetWorkUtil.js')
import {
  $yjpToast
} from '../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsNo:``,
    page:1,
    size:10,
    windowHeight:0,
    isEmpty:false,
    evaluateList:[],
    isEmpty:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let goodsNo = options.goodsNo
    const systemInfo = App.globalData.systemInfo;
    let titleHeight = systemInfo.windowWidth / 750 * 90;
    this.setData({goodsNo,windowHeight: systemInfo.windowHeight - titleHeight})
    this.getValuate()
  },

  //获取评价列表
  getValuate(){
    let {goodsNo,page,size,isEmpty,evaluateList} = this.data
    wx.showLoading({
      title: '加载中'
    })
    api._get(`api/v1/jc/mall/goods/comments`,{goodsNo,page,size}).then(data=>{
      if ((!data.data || !data.data.length) && page == 1) {
        this.setData({
          evaluateList: [],
          isEmpty: true
        })
      } else if ((!data.data || !data.data.length) && page != 1) {
        $yjpToast.show({
          text: `没有更多数据了`
        })
      } else {
        let oldArr = evaluateList
        let newArr = data.data
        let finaArr = oldArr.concat(newArr)
        this.setData({
          evaluateList: finaArr,
          page: ++page
        })
        console.log(finaArr)
      }
      this.setData({total:data.total})
      wx.hideLoading();
    })
    
  },

  lower(){
    this.getValuate()
  },
  onPullDownRefresh() {
    wx.setNavigationBarTitle({
      title: '刷新中……'
    }) //动态设置当前页面的标题。

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
    this.data.page = 1
    this.data.evaluateList = []
    this.getValuate(); //重新加载产品信息

    wx.hideNavigationBarLoading(); //隐藏导航条加载动画。

    wx.stopPullDownRefresh(); //停止当前页面下拉刷新。

    console.log("关闭");

    wx.setNavigationBarTitle({
      title: '商品评价'
    }) //动态设置当前页面的标题。
  },
  onReachBottom() {
    wx.showNavigationBarLoading();
    this.getValuate()
  },
})