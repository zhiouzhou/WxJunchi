// pages/user/orders/ealuation.js
const App = getApp()
const api = require('../../../utils/NetWorkUtil.js')
import {$yjpToast} from '../../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stars: [{
      id: 1
    }, {
      id: 2
    }, {
      id: 3
    }, {
      id: 4
    }, {
      id: 5
    }],
    content:``,

    starId: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let orderNo = options.orderNo
    let goodsImage = options.goodsImage
    let access_token = wx.getStorageSync(`access_token`)
    this.setData({ orderNo, goodsImage,access_token})
  },
  onContent(e){
    let content = e.detail.value
    this.setData({content})
    this.check_result
  },
  //点击星星评分
  score_xing(e) {
    this.data.starId = e.currentTarget.dataset.index+1;
    this.setData({
      starId: this.data.starId
    })
    console.log(this.data.starId)
    this.check_result()
  },
  submitOrder(){
    let { starId, access_token, orderNo, content} = this.data
    let result = this.check_result()
    if(!result.success){
     return  $yjpToast.show({text:result.desc})
    }
    // if(!starId||!content){
    //   return $yjpToast.show({text:`请填写评价`})
    // }
    let url = `api/v1/jc/mall/order/comment?access_token=${access_token}`
    api._post(url, { orderNo, content, grade:starId}).then(data=>{
      if(data.code==0){
        $yjpToast.show({text:data.desc})
        setTimeout(()=>{
          App.WxService.navigateBack()        
        },500)
      }else{
        $yjpToast.show({ text: data.desc })
      }
    })
  },
  check_result(){
    let { starId, access_token, orderNo, content } = this.data
     if(!starId) {
      return {
        success: false,
        desc: `请对商品进行评分~`
      }
    } else if (!content){
      return {
        success: false,
        desc: `请填写评价~`
      }
    }else {
      return {
        success: true,
        desc: `~`
      }
    }
  },
})