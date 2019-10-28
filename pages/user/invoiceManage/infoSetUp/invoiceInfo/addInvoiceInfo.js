// pages/user/invoiceManage/infoSetUp/invoiceInfo/addInvoiceInfo.js
const App = getApp()
const api = require('../../../../../utils/NetWorkUtil')
import {
  $yjpToast
} from '../../../../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    invoiceInfo:{preferred:false},
    pageType:'add'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let pageType = options.pageType
    let title = pageType == 'add' ? '新增发票信息' : '编辑发票信息'
    let memberId = wx.getStorageSync(`userInfo`).memberId;
    let access_token = wx.getStorageSync(`access_token`)
    wx.setNavigationBarTitle({
      title
    })
    this.setData({
      pageType,memberId,access_token
    })
    if(pageType=='edit'){
      this.setData({invoiceInfo:JSON.parse(options.invoiceInfo)})
    }
  },
  //绑定发票抬头输入
  onTitle(e){
    let title = e.detail.value
    this.setData({"invoiceInfo.title":title})
  },
  //绑定税号输入
  onTaxNo(e){
    let taxNo = e.detail.value
    this.setData({"invoiceInfo.taxNo":taxNo})
  },
  //绑定注册地址    选填
  onAddr(e){
    let addr = e.detail.value
    this.setData({"invoiceInfo.addr":addr})
  },
  //绑定开户电话    选填
  onPhone(e){
    let phone = e.detail.value
    this.setData({"invoiceInfo.phone":phone})
  },
  //绑定开户银行   选填  
  onBankType(e){
    let bankType = e.detail.value
    this.setData({"invoiceInfo.bankType":bankType})
  },
  //绑定银行账号
  onBankNo(e){
    let bankNo = e.detail.value
    this.setData({"invoiceInfo.title":bankNo})
  },
  defaultSelect(){
    this.setData({
      'invoiceInfo.preferred':!this.data.invoiceInfo.preferred
    })
  },
  submit(){
    let {invoiceInfo,memberId,access_token,pageType} = this.data
    let params = invoiceInfo
    let addUrl = `api/v1/user/${memberId}/invoiceInfo?access_token=${access_token}`
    let editUrl = `api/v1/user/${memberId}/invoiceInfo/${invoiceInfo.id}?access_token=${access_token}`
    if (!invoiceInfo.title || !invoiceInfo.taxNo){
      return $yjpToast.show({text:`请输入发票信息`})
    }
    if(pageType=='add'){
      api._post(addUrl,params).then(data=>{
        console.log(data)
        if(data.code==0){
          $yjpToast.show({text:data.desc})
          setTimeout(() => {
            App.WxService.navigateBack()
          }, 500)
        }else {
          $yjpToast.show({text:data.desc})
        }
      })
    }else {
      api._put(editUrl,params).then(data=>{
        console.log(data)
        if(data.code==0){
          $yjpToast.show({text:data.desc})
          setTimeout(() => {
            App.WxService.navigateBack()
          }, 500)
        }else {
          $yjpToast.show({text:data.desc})
        }
      })
    }
    

  },

})