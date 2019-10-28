const App = getApp()
const CodeNum = App.Constants.CodeNum
import {
  $yjpCountDown,
  $yjpToast
} from "../../../components/yjp.js"

function onAccountBlur_old(e) {
  this.setData({
    oldMobile: e.detail.value
  })
}


//发送验证码

