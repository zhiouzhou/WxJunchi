// pages/user/accountManage/sub.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    subList:[],
    isEmpty:false,
    defaultImg:`/assets/image/ic-touxiang@2x.png`
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(JSON.parse(options.userInfo))
    let subArr = wx.getStorageSync(`userInfo`).subordinates
    if(!subArr||!subArr.length){
      this.setData({ subList: [],isEmpty:true })
    }else {
      this.setData({ subList: subArr,isEmpty: false})
    }
  },
  binderrorimg: function (e) {
    console.log(e)
    var errorImgIndex = e.target.dataset.errorimg //获取循环的下标
    var imgObject = "subList[" + errorImgIndex + "].headPic" //evaluateList
    console.log(imgObject)
    var errorImg = {}
    errorImg[imgObject] = this.data.defaultImg //我们构建一个对象
    this.setData(errorImg) //修改数据源对应的数据
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },


})