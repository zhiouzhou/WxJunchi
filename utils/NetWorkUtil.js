const baseUrl = 'https://jl.jcstauto.com/';
const App = getApp()

const http = ({
  url = '',
  param = {},
  ...other
} = {}) => {
  // wx.showLoading({
  //   title: '加载中...'
  // });
  // let access_token = App.getToken
  wx.showNavigationBarLoading()

  let timeStart = Date.now();
  let access_token = App.getToken()
  return new Promise((resolve, reject) => {
    wx.request({
      url: getUrl(url),
      data: param,
      header: {
        'content-type': 'application/x-www-form-urlencoded', // 默认值 ,另一种是 "content-type": "application/x-www-form-urlencoded"
      },
      ...other,
      complete: (res) => {
        console.log(res)
        // wx.hideLoading();
        wx.hideNavigationBarLoading()
        console.log(`耗时${Date.now() - timeStart}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else if (res.statusCode == 401) {
          reject(res)
          var pages = getCurrentPages() //获取加载的页面
          var currentPage = pages[pages.length - 1] //获取当前页面的对象
          var url = currentPage.route //当前页面url
          let path = url.split("/")[2]
          // let params = window.location.search
          console.log(path)
          if (path == 'login' || path == 'codeInput') {
            reject(res)
          } else {
            App.WxService.navigateTo(App.Constants.Route.login, {
              path
            },1000)

          }
        }
      }
    })
  })
}

const getUrl = (url) => {
  if (url.indexOf('://') == -1) {
    url = baseUrl + url;
  }
  return url
}

// get方法
const _get = (url, param = {}, headerType = {}) => {
  return http({
    url,
    param,
    headerType
  })
}

const _post = (url, param = {}, headerType = {}) => {
  return http({
    url,
    param,
    method: 'post',
    header: headerType
  })
}

const _put = (url, param = {}, headerType = {}) => {
  return http({
    url,
    param,
    method: 'put',
    header: headerType
  })
}

const _delete = (url, param = {}, headerType = {}) => {
  return http({
    url,
    param,
    method: 'delete',
    header: headerType
  })
}
module.exports = {
  baseUrl,
  _get,
  _post,
  _put,
  _delete
}

