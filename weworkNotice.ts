import fly from "flyio" 
import {
  weixinWebhook,
  chatid
} from "./const"


export const sendMessage = function(content: Object, msgType: String) {
  fly.post(weixinWebhook, {
      "chatid": chatid,
      "msgtype": msgType,
      ...content
  }).then(res=> {
    // console.log(res)
  }).catch(e=> {
    console.error(e)
  })
}

export const sendTextMessage = function(content: String) {
  fly.post(weixinWebhook, {
      "chatid": chatid,
      "msgtype": "text",
      "text": {
        "content": content
      }
  }).then(res=> {
    // console.log(res)
  }).catch(e=> {
    console.error(e)
  })
}

export const sendMarkDownMessage = function(content: String) {
  fly.post(weixinWebhook, {
      "chatid": chatid,
      "msgtype": "markdown",
      "markdown": {
        "content": content
      }
  }).then(res=> {
    // console.log(res)
  }).catch(e=> {
    console.error(e)
  })
}

export const sendImageMessage = function(base64: String, md5: String) {
  console.log(base64)
  console.log(md5)
  fly.post(weixinWebhook, {
      "chatid": chatid,
      "msgtype": "image",
      "image": {
        "base64": base64,
        "md5": md5
      }
  }).then(res=> {
    console.log(res)
  }).catch(e=> {
    console.error(e)
  })
}