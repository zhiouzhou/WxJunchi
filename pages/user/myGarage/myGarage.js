// pages/user/myGarage/myGarage.js
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
    windowHeight: 0,
    garageList: [],
    page: 1,
    size: 10,
    isEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    let access_token = wx.getStorageSync(`access_token`)
    console.log(options)
    const systemInfo = App.globalData.systemInfo;
    
    this.setData({
      windowHeight: systemInfo.windowHeight,
      access_token,
      page:1,
      garageList:[]
    })
    this.getGarageList()
  },
  onLoad(options){
    let pageType = options.pageType?options.pageType:''
    this.setData({
      pageType
    })
  },
  //获取车辆信息列表
  getGarageList() {
    wx.showLoading({
      title: '加载中~',
    })
    let {
      page,
      size,
      access_token,
      garageList
    } = this.data
    api._get(`api/v1/user/car/list`, {
      access_token,
      page,
      size
    }).then(data => {
      if ((!data.data || !data.data.length) && page == 1) {
        this.setData({
          garageList: [],
          isEmpty: true
        })
      } else if ((!data.data || !data.data.length) && page != 1) {
        $yjpToast.show({
          text: `没有更多数据了`
        })
      } else {
        let oldArr = garageList
        let newArr = data.data
        let finaArr = oldArr.concat(newArr)
        this.setData({
          garageList: finaArr,
          page: ++page,
          isEmpty:false
        })
        console.log(finaArr)
      }
      wx.hideLoading();
    })
  },
  lower() {
    this.getGarageList()
  },
  //绑定新增车辆信息按钮
  addGarage(e) {
    let pageType = e.currentTarget.dataset.pageType
    let garageItem = e.currentTarget.dataset.garageItem
    
    App.WxService.navigateTo(App.Constants.Route.addGarage, {
      pageType,
      garageItem
    })
  },
  delete(e) {
    let that = this
    let id = e.currentTarget.dataset.id
    let access_token = this.data.access_token
    let garageList = this.data.garageList
    let url = `api/v1/user/car/${id}?access_token=${access_token}`
    api._delete(url).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: data.desc
        })
        // garageList = garageList.filter(item=>{
        //   return item.id!==id
        // })
        this.setData({ page:1})
        
        that.getGarageList()
      }
    })

  },
  onPullDownRefresh() {
    wx.setNavigationBarTitle({
      title: '刷新中……'
    }) //动态设置当前页面的标题。

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
    this.data.page = 1
    this.data.garageList = []
    this.getGarageList(); //重新加载产品信息

    wx.hideNavigationBarLoading(); //隐藏导航条加载动画。

    wx.stopPullDownRefresh(); //停止当前页面下拉刷新。

    console.log("关闭");

    wx.setNavigationBarTitle({
      title: '我的车库'
    }) //动态设置当前页面的标题。
  },
  onReachBottom() {
    wx.showNavigationBarLoading();
    this.getGarageList()
  },
  // 选择车辆
  selectGarage(e){
    let garageItem = e.currentTarget.dataset.garageItem
    if(!this.data.pageType){
      return 
    }
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    // 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      garageInfo:garageItem
    })
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    })
  },
})