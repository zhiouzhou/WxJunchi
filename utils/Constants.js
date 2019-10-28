const RouteConstants = {
  //授权页面
  index: `/pages/index/index`,
  //登录
  login: `/pages/login/login`,
  // 获取验证码页面
  codeInput: `/pages/login/codeInput`,
  // 四大页面
  homePage: `/pages/homePage/homePage`,
  message: `/pages/message/message`,
  shopCart: `/pages/shopCart/shopCart`,
  user: `/pages/user/user`,
  // 我的钱包
  myWallet: `/pages/user/myWallet/myWallet`,
  // 我的订单
  myOrder: `/pages/user/orders/myOrder`,
  //订单详情
  orderDetail: `/pages/user/orders/orderDetail`,
  // 订单评价
  ealuation: `/pages/user/orders/ealuation`,
  // 商品详情
  productDetail: `/pages/product/productDetail`,
  //账户管理
  accountManage: `/pages/user/accountManage/accoutManage`,
  //修改资料
  editData: `/pages/user/accountManage/editData`,
  //修改资料的共同页面
  editDataPage: `/pages/user/accountManage/editDataPage`,
  //收货地址
  receiveAddress: `/pages/user/receiveAddress/receiveAddress`,
  //新增收货地址
  addReceiveAddress: `/pages/user/receiveAddress/addReceiveAddress`,
  //订单提交
  placeOrder: `/pages/shopCart/placeOrder`,
  //我的银行卡
  myBankCard: `/pages/user/myBankCard/myBankCard`,
  //新增银行卡
  addBankCard: `/pages/user/myBankCard/addBankCard`,
  complaint: `/pages/user/complaint`,
  // 关于我们
  aboutUs: `/pages/user/aboutUs`,
  //我的车库
  myGarage: `/pages/user/myGarage/myGarage`,
  //新增车库
  addGarage: `/pages/user/myGarage/addGarage`,
  // 发票管理
  invoiceManage: `/pages/user/invoiceManage/invoiceManage`,
  //根据订单开具发票
  invoiceAccordToOrder: `/pages/user/invoiceManage/invoiceAccordToOrder`,
  //开具发票
  invoicing: `/pages/user/invoiceManage/invoicing`,
  //开票历史记录
  invoiceHistory: `/pages/user/invoiceManage/invoiceHistory/invoiceHistory`,
  //开票历史记录详情
  invoiceDetail: `/pages/user/invoiceManage/invoiceHistory/invoiceDetail`,
  //常用信息设置
  infoSetUp: `/pages/user/invoiceManage/infoSetUp/infoSetUp`,
  //发票信息
  invoiceInfo: `/pages/user/invoiceManage/infoSetUp/invoiceInfo/invoiceInfo`,
  //新增常用开票信息
  addInvoiceInfo: `/pages/user/invoiceManage/infoSetUp/invoiceInfo/addInvoiceInfo`,
  //电子邮箱列表
  emailList: `/pages/user/invoiceManage/infoSetUp/emailList/emailList`,
  //设置登录密码
  setLoginPsw: `/pages/user/accountManage/setLoginPsw`,
  //新增电子邮箱
  addEmail: `/pages/user/invoiceManage/infoSetUp/emailList/addEmai`,
  //配送地址列表
  deliveryAddress: `/pages/user/invoiceManage/infoSetUp/deliveryAddress/deliveryAddress`,
  //新增配送地址
  addDeliveryAddress: `/pages/user/invoiceManage/infoSetUp/deliveryAddress/addDeliveryAddress`,
  //忘记密码
  findPassword: `/pages/login/findPassword`,
  //设置支付密码
  setPayPass: `/pages/user/accountManage/setPayPass`,
  //地图
  address: `/pages/shopCart/address`,
  //预约安装
  productInstall: `/pages/user/orders/productInstall`,
  //评价列表
  evaluateList: `/pages/product/evaluateList`,
  //下级人员列表
  subordinate: `/pages/user/accountManage/subordinate`,
  //消息资讯  首页图片跳转页面
  information: `/pages/homePage/information`,
  //行业资讯
  industry: `/pages/homePage/industry`,
  //申请维修
  applyService:`/pages/user/orders/applyService`,
  //门店信息
  storeInfo:`/pages/user/orders/storeInfo`,
  //推广助手
  helper:`/pages/homePage/helper`,
  //实名认证
  identification:`/pages/user/accountManage/identification`,
  //提现
  withdraw:`/pages/user/myWallet/withdraw`,
  //行业资讯webview
  activity:`/pages/homePage/activity`

}

//小程序AppId
const AppId = `wx18e562e65420bef4`
//腾讯地图定位key
const TencentMapKey = `IRFBZ-5VHW5-DWPIE-QIG34-OU3QJ-FKFDL`
// 验证码
const CodeNum = 6
module.exports = {
  Route: RouteConstants,
  AppId,
  TencentMapKey,
  CodeNum
}