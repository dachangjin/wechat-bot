import {Contact, log, Message, ScanStatus, WechatyBuilder} from "wechaty"
import {PuppetPadlocal} from "wechaty-puppet-padlocal"

import {
  sendTextMessage,
  sendMarkDownMessage,
  sendImageMessage
} from "./weworkNotice"

import fly from "flyio"
const jwt = require('jsonwebtoken')
const QRCode = require('qrcode')
const md5 = require("md5")


import {
  puppetToken,
  wechatAIToken,
  wechatAIEncodingAESKey,
  LOGPRE
} from "./const"

/****************************************
 * 去掉注释，可以完全打开调试日志
 ****************************************/
// log.level("silly")

const signature = jwt.sign({
  username: "tommy",
  userid: "tommy",
  avatar: "",
},
wechatAIEncodingAESKey,
{ algorithm: 'HS256' }
)

const puppet = new PuppetPadlocal({
    token: puppetToken
})


const bot = WechatyBuilder.build({
  name: "wechat-bot",
  puppet,
})
bot.on("scan", (qrcode, status) => {
  if (status === ScanStatus.Waiting && qrcode) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')

    log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`)

    console.log("\n==================================================================")
    console.log("\n* Two ways to sign on with qr code")
    console.log("\n1. Scan following QR code:\n")

    require('qrcode-terminal').generate(qrcode, {small: true})  // show qrcode on console

    console.log(`\n2. Or open the link in your browser: ${qrcodeImageUrl}`)
    console.log(qrcode)
    console.log("\n==================================================================\n")
    // 发送到企微提醒扫码
    sendMarkDownMessage(`**等待扫码登录**\n打开链接扫码\n**[点我扫码](${qrcodeImageUrl})**`)
  } else {
    log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`)
    sendMarkDownMessage(`**登录扫码结果**\n${ScanStatus[status]}(${status})`)
  }
})
bot.on("login", (user) => {
  log.info(LOGPRE, `${user} login`)
  sendMarkDownMessage(`**微搭客服机器人：${user.name()}已经登录**`)
})

bot.on("logout", (user, reason) => {
  log.info(LOGPRE, `${user} logout, reason: ${reason}`)
  sendMarkDownMessage(`**<font color=\"red\">微搭客服机器人：${user.name()}已经退出登录</font>**\n原因:${reason}\n请尽快重新登录`)
})

bot.on("message", async (message) => {
  log.info(LOGPRE, `on message: ${message.toString()}`)
  try {
    if (!message.room()) return
    if (message.self()) return
    if (!(await message.mentionSelf())) return
    if (message.type() !== bot.Message.Type.Text) {
      message.say("请发送文本消息")
      return
    }
    const content = await message.mentionText()
    if (content.length === 0) {
      message.say("请不要发送空消息")
      return
    }
    const result = await fly.post(`https://openai.weixin.qq.com/openapi/aibot/${wechatAIToken}`, {
      signature: signature,
      query: content
    })
    var answer = ""
    if (result.data.answer) {
      answer += result.data.answer
    }
    if (result.data.options && result.data.options instanceof Array) {
      answer += '\n\r\n'
      result.data.options.forEach((item: { title: string }) => {
        answer += item.title
        answer += "\n"
      })
    }
    const toRoom = message.room()!
    const atUserList: Contact[] = [message.from()!];
    await toRoom.say(answer, ...atUserList)
  } catch (e) {
    console.log(e)
    // 企微提醒
    sendMarkDownMessage(`**<font color=\"red\">微搭客服机器人请求服务报错：请尽快处理</font>**`)
  }
})

bot.on("error", (e) => {
  // 企微提醒
  console.log(e)
  sendMarkDownMessage(`**<font color=\"red\">微搭客服机器人服务报错：请尽快处理</font>**`)
})


bot.start().then(() => {
  log.info(LOGPRE, "started.")
  sendMarkDownMessage(`**微搭客服机器人服务已开启**`)
})



