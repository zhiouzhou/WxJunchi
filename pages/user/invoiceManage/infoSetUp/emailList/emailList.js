// pages/user/invoiceManage/infoSetUp/emailList/emailList.js
const App = getApp()
const api = require('../../../../../utils/Constants.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emailList: [{
      state: 1,
      defaultAddress: true,
      company: '北京神州天鸿科技有限公司',
      memberNum: '103045878',
      province: '北京',
      city: '北京市',
      county: '丰台区',
      street: '四环到五环之间',
      detailAddress: '航丰路一号院'

    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  addEmail(e){
    let tag = e.currentTarget.dataset.tag
    let pageType = e.currentTarget.dataset.pageType
    App.WxService.navigateTo(App.Constants.Route[tag], { pageType })
  },
  edit(e){
    let tag = e.currentTarget.dataset.tag
    let pageType = e.currentTarget.dataset.pageType
    let emailInfo = e.currentTarget.dataset.email
    App.WxService.navigateTo(App.Constants.Route[tag], { pageType,emailInfo })
  },

})