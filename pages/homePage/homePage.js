// pages/homePage/homePage.js
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
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    // canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // isHide: false,
    imgInfoArrLength: 0, // 轮播图列表的长度
    imgUrls: [],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 500,
    circular: true,
    centerItem: 0,
    access_token: ``,
    page: 1, //页码
    size: 5, //每页数量
    windowHeight: 0,
    productList: [],
    feed_style: {
      x: "",
      y: "",
    }, //这个参数是定位使用的x ， y值
    screen: { //仅在js里面传递的参数：
      width: "",
      height: ""
    }, // 用于保存屏幕页面信息
    preX: '', //上次的x值
    preY: '', //上次的y值
    showSkeleton: true,
    memberId: ``,
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let len = this.data.imgUrls.length;
    let center = parseInt(len / 2);
    // let access_token = wx.getStorageSync(`access_token`)
    const systemInfo = App.globalData.systemInfo;
    let memberId = wx.getStorageSync(`userInfo`).memberId
    console.log(memberId)
    console.log(systemInfo)
    const that = this;
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 2000)
    // let titleHeight = systemInfo.windowWidth / 750 * 92;
    if (systemInfo.platform == "android") {
      systemInfo.windowHeight = systemInfo.screenHeight;
    }
    this.setData({
      memberId: memberId,
      imgInfoArrLength: len,
      centerItem: center,
      // access_token,
      windowHeight: systemInfo.windowHeight,
      productList: [],
      page: 1,
      //  - titleHeight
      screen: {
        width: systemInfo.windowWidth,
        height: systemInfo.windowHeight,
        pixelRatio: systemInfo.pixelRatio,
        ratio: systemInfo.windowWidth * systemInfo.pixelRatio / 750
      }
    })
    // console.log(App.globalData.systemInfo)
    // if (App.globalData.inviter) {
    //   console.log(App.globalData.inviter)
    //   // this.setData({ inviter: App.globalData })
    //   let inviter = App.globalData.inviter
    // }
    if (options.scene) {
      let scene = options.scene
      console.log(scene)
      console.log(decodeURIComponent(scene))
      scene = decodeURIComponent(scene)
      console.log(scene)
      let inviter = scene.split('=')[1]
      console.log(inviter)
      let access_token = wx.getStorageSync(`access_token`)
      console.log(access_token)
      App.globalData.inviter = inviter
      console.log(App.globalData)
    }else {
      App.globalData.inviter = ``
    }
    console.log(App.globalData.inviter)
    this.getImages();
    this.getProductList()

  },
  onShow() {
    // this.setData({
    //   // access_token: App.getToken()
    // })
    console.log(this.data.access_token)
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
  Fen2Yuan(num) {
    if (typeof num !== "number" || isNaN(num)) return null;
    return (num / 100.0);
  },
  changeFun(e) {
    this.setData({
      centerItem: e.detail.current
    })
  },

  //获取有效轮播图
  getImages() {
    api._get(`api/v1/junchi/operations/carousel/getShowCarousel`, {
      page: 1,
      size: 0,
      noToken: true
    }).then(data => {
      console.log(data)
      this.setData({
        imgUrls: data.data
      })
    })
  },
  //获取商品列表
  getProductList() {
    // access_token,先去掉
    let {
      // access_token,
      page,
      size,
      productList
    } = this.data
    let that = this
    wx.showLoading({
      title: '加载中'
    })
    let url = `api/v1/jc/mall/goods/list?page=${page}&size=${size}&status=NORMAL&status=NO_STOCK`
    api._get(url, {}).then(data => {
      console.log(data)
      if ((!data.data || !data.data.length) && page == 1) {
        this.setData({
          productList: []
        })
      } else if ((!data.data || !data.data.length) && page != 1) {
        $yjpToast.show({
          text: `没有更多数据了`
        })
      } else {
        let oldArr = productList
        let newArr = data.data
        newArr.forEach(item => {
          item.currentPrice = that.Fen2Yuan(parseInt(item.currentPrice))
          item.originPrice = that.Fen2Yuan(parseInt(item.originPrice))
          item.favorableCount = item.favorableCount * 100
          item.reviewScore = item.reviewScore == 0 ? 5 : item.reviewScore
        })
        let finaArr = oldArr.concat(newArr)

        this.setData({
          productList: finaArr,
          page: ++page
        })

        // this.setData({productList})
        console.log(this.data.productList)
      }
      wx.hideLoading();
    }).catch(e => {

    })
  },
  lower() {
    this.getProductList()
  },
  upper() {
    console.log(`下拉刷新`)
    wx.startPullDownRefresh();
    wx.showNavigationBarLoading()
    let that = this
    this.setData({
      page: 1,
      productList: [],
      imgUrls: []
    })
    this.getProductList()
    this.getImages()
    setTimeout(() => {
      wx.stopPullDownRefresh() //停止下拉刷新
      wx.hideNavigationBarLoading()
      // 隐藏下拉刷新的布局
      that.setData({
        refreshing: false,
      });
    }, 1000);
  },
  // 去商品详情
  gotoProductDetail(e) {
    console.log(e.currentTarget.dataset.productId)
    let productNo = e.currentTarget.dataset.productNo;
    let productItem = e.currentTarget.dataset.productItem
    App.WxService.navigateTo(App.Constants.Route.productDetail, {
      productNo,
      productItem
    })
  },

  //加入购物车
  addShopCart(e) {
    let no = e.currentTarget.dataset.no
    let access_token = wx.getStorageSync(`access_token`)
    let count = 0
    api._post('api/v1/jc/mall/cart/item', {
      goodsNo: no,
      access_token
    }, {
      'content-type': 'application/x-www-form-urlencoded',
    }).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: `添加购物车成功`
        })
        count = data.data.count + data.data.count
        // console.log(string(count))
        // wx.setTabBarBadge({
        //   index: 2,
        //   text: String(count)
        // })
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    }).catch(e => {
      $yjpToast.show({
        text: data.desc
      })
    })
  },
  touchMove(e) {
    console.log(e)
    var tmpx = parseInt(e.touches[0].clientX);
    var tmpy = parseInt(e.touches[0].clientY);
    if (tmpx <= 0 || tmpy <= 0 || tmpx >= this.data.screen.width || tmpy >= this.data.screen.height) {} else {
      if (tmpx != this.data.preX || tmpy != this.data.preY) {
        console.log(e.touches[0].clientX, "-X-", e.touches[0].pageX)
        console.log(e.touches[0].clientY, "-Y-", e.touches[0].pageY)
        this.data.preX = tmpx
        this.data.preY = tmpy
        this.setData({
          feed_style: {
            x: tmpx - 60 + "px",
            y: tmpy - 60 + "px",
          }
        })
      }
    }
  },
  // 绑定客服点击事件 进入投诉建议页面
  gotoEvalute() {
    App.WxService.navigateTo(App.Constants.Route.complaint)
  },
  //跳转到相应网页
  gotoImageDetail(e) {
    console.log(e.currentTarget.dataset.infoUrl)
    let infoUrl = encodeURIComponent(e.currentTarget.dataset.infoUrl)
    App.WxService.navigateTo(App.Constants.Route.information, {
      infoUrl
    })
  },
  gotoHelper() {
    App.WxService.navigateTo(App.Constants.Route.helper)
  },
  //去行业资讯
  gotoIndustry() {
    App.WxService.navigateTo(App.Constants.Route.industry)
  },
  // onPullDownRefresh: function() {
  //   console.log(`下拉刷新`)
  //   this.getProductList().then(()=>{
  //     wx.stopPullDownRefresh()
  //   })
  // },
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
    this.data.page = 1
    this.data.productList = []
    this.getProductList(); //重新加载产品信息
    this.getImages();
    wx.hideNavigationBarLoading(); //隐藏导航条加载动画。

    wx.stopPullDownRefresh(); //停止当前页面下拉刷新。

    console.log("关闭");
  },
  onReachBottom() {
    wx.showNavigationBarLoading();
    this.getProductList()
  },


})