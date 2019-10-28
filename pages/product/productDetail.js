// pages/product/productDetail.js
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
    currentPage: 1,
    imgCount: 0,
    productInfo: {},
    evaluateList: [],
    productItem: {},
    isEmpty: false,
    showSkeleton: true,
    defaultImg: `/assets/image/ic-touxiang@2x.png`
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let no = options.productNo
    console.log(options)
    let productItem = options.productItem?JSON.parse(options.productItem):{}
    let memberId = wx.getStorageSync(`userInfo`).memberId
    // console.log(options.productItem)
    // let count = this.data.imgUrls.length
    const that = this;
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 500)
    this.setData({
      // imgCount: count,
      // access_token,
      productItem,
      memberId
    })
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
    } else {
      App.globalData.inviter = ``
    }
    console.log(App.globalData.inviter)
    this.getProductDetail(no)
    this.getEvaluate(no)
  },
  onShow() {
    // let access_token = wx.getStorageSync(`access_token`)
    this.setData({
      access_token: App.getToken()
    })

  },
  // 获取商品详情
  getProductDetail(no) {
    let access_token = this.data.access_token
    let url = `api/v1/jc/mall/goods/${no}`
    api._get(url, {
      access_token
    }).then(data => {
      let productInfo = data.data
      // productInfo.favorableCount = productInfo.favorableCount == 0 ?100:productInfo.favorableCount*100
      productInfo.favorableCount = productInfo.favorableCount * 100
      let count = data.data.swiperImgs.length
      this.setData({
        productInfo: data.data,
        imgCount: count
      })
    })
  },
  //获取评价列表
  getEvaluate(no) {
    let {
      access_token,
      isEmpty
    } = this.data
    // let url = `api/v1/jc/mall/order/comment?accessToken=${access_token}&goodsNo=${no}`
    let url = `api/v1/jc/mall/goods/comments`
    api._get(url, {
      goodsNo: no,
      page: 1,
      size: 3
    }).then(data => {
      console.log(data)
      if (data.code == 0) {
        if (!data.data || !data.data.length) {
          this.setData({
            evaluateList: [],
            total: data.total,
            isEmpty: true,
          })

        } else {
          this.setData({
            evaluateList: data.data,
            isEmpty: false,
            total: data.total,
          })
        }

      }
    })
  },
  binderrorimg: function(e) {
    console.log(e)
    var errorImgIndex = e.target.dataset.errorimg //获取循环的下标
    var imgObject = "evaluateList[" + errorImgIndex + "].headPic" //evaluateList
    console.log(imgObject)
    var errorImg = {}
    errorImg[imgObject] = this.data.defaultImg //我们构建一个对象
    this.setData(errorImg) //修改数据源对应的数据
  },
  // 查看全部评价
  checkAll(e) {
    let goodsNo = e.currentTarget.dataset.goodsNo
    App.WxService.navigateTo(App.Constants.Route.evaluateList, {
      goodsNo
    })
  },
  changeFun(e) {
    console.log(e)
    console.log(e)
    this.setData({
      currentPage: e.detail.current + 1
    })
  },
  // 加入购物车
  //加入购物车
  addShopCart(e) {
    let no = e.currentTarget.dataset.no
    let access_token = this.data.access_token
    api._post('api/v1/jc/mall/cart/item', {
      goodsNo: no,
      access_token
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    }).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: `添加购物车成功`
        })
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    })
  },
  //转发分享
  onShareAppMessage(res) {
    let name = res.target.dataset.productName
    let productNo = res.target.dataset.productNo
    let productItem = JSON.stringify(this.data.productItem)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    };
    return {
      title: name,
      path: `/pages/product/productDetail?scene=inviter%3D${this.data.memberId}&productNo=${productNo}&productItem=${productItem}`
    }

  },
  //立即购买
  buyNow(e) {
    let productInfo = e.currentTarget.dataset.productInfo;
    let productList = [productInfo]
    console.log(productList)
    let count = e.currentTarget.dataset.count;
    let pageType = e.currentTarget.dataset.pageType
    let totalPrice = e.currentTarget.dataset.totalPrice
    App.WxService.navigateTo(App.Constants.Route.placeOrder, {
      productList,
      count,
      pageType,
      totalPrice
    })
  },
  //去购物车
  gotoShopCart() {
    App.WxService.switchTab(App.Constants.Route.shopCart)
  },
})