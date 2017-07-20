import Discord from 'discord.js'

import Account from './Account'
import { discordToken } from './scripts/credentials'

export default class Bot {
  constructor () {
    this.client = new Discord.Client()

    this.client.on('ready', () => {
      console.log('Discord bot initialized')
      this.channel = this.client.channels.get('334977257456271360')
    })

    this.client.on('guildMemberAdd', member => {
      this.channel.send(`User "${member.user.username}" has joined the server`)
    })

    this.client.on('guildMemberRemove', member => {
      this.channel.send(`User "${member.user.username}" has left the server`)
    })
  }

  async login () {
    await this.client.login(discordToken)
  }

  uploadCourse (courses) {
    if (courses.length === 0) return
    const isMany = courses.length > 1
    const ownerName = Account.getAccount(courses[0].owner).username
    const messages = []
    messages[0] = isMany ? `New courses have been uploaded by ${ownerName}:` : `A new course has been uploaded by ${ownerName}`
    let messageIndex = 0
    for (let i in courses) {
      const course = courses[i]
      let autoScroll = `${course.autoScroll === 1 ? (
        '<:turtle:334989248526811146>'
      ) : (
        course.autoScroll === 2 ? (
          '<:rabbit:334989248266633216>'
        ) : (
          course.autoScroll === 3 ? (
            '<:cheetah:334989248191004673>'
          ) : (
            ''
          )
        )
      )}`
      autoScroll += `${course.autoScrollSub === 1 ? (
        '<:turtle:334989248526811146>'
      ) : (
        course.autoScrollSub === 2 ? (
          '<:rabbit:334989248266633216>'
        ) : (
          course.autoScrollSub === 3 ? (
            '<:cheetah:334989248191004673>'
          ) : (
            ''
          )
        )
      )}`
      let append = `
      ${course.gameStyle === 0 ? (
    '    <:smb:334989248593920000>'
  ) : (
    course.gameStyle === 1 ? (
      '    <:smb3:334989248749109248>'
    ) : (
      course.gameStyle === 2 ? (
        '    <:smw:334989248539262978>'
      ) : (
        '    <:nsmbu:334989248975470592>'
      )
    )
  )} ${course.title} by ${course.maker}${autoScroll ? ` ${autoScroll}` : ''}`
      if (messages[messageIndex].length + append.length > 2000) {
        messages.push('')
        messageIndex++
      }
      messages[messageIndex] += append
    }
    for (let i in messages) {
      this.channel.send(messages[i])
    }
  }
}
