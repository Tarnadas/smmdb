import Discord from 'discord.js'

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

  uploadCourse (courses, account) {
    if (courses.length === 0) return
    const isMany = courses.length > 1
    const ownerName = account.username
    const messages = []
    messages[0] = isMany ? `New <:smm:352479783474692097> courses have been uploaded by ${ownerName}:` : `A new <:smm:352479783474692097> course has been uploaded by ${ownerName}`
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

  uploadCourse64 (course, account) {
    this.channel.send(`A new <:sm64m:352480143706685442> course has been uploaded by ${account.username}\n          ${course.title}`)
  }

  updateCourse (course, account) {
    const ownerName = account.username
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
    const message = `A course has been updated by ${ownerName}
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
    this.channel.send(message)
  }
}
