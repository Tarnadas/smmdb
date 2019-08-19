import * as Discord from 'discord.js'

const FAQ_ID = '335060849091936256'

export class DiscordBot {
  private client: Discord.Client

  private channel?: Discord.TextChannel

  private faqChannel?: Discord.TextChannel

  public constructor () {
    this.client = new Discord.Client()

    this.client.on(
      'ready',
      (): void => {
        console.log('Discord bot initialized')
        this.channel = this.client.channels.get(
          '334977257456271360'
        ) as Discord.TextChannel
        this.faqChannel = this.client.channels.get(
          FAQ_ID
        ) as Discord.TextChannel
        this.updateFAQ()
      }
    )

    this.client.on(
      'guildMemberAdd',
      (member: Discord.Client): void => {
        ;(this.channel as any).send(
          `User "${member.user.username}" has joined the server`
        )
      }
    )

    this.client.on(
      'guildMemberRemove',
      (member: Discord.Client): void => {
        ;(this.channel as any).send(
          `User "${member.user.username}" has left the server`
        )
      }
    )
  }

  public async login (): Promise<void> {
    try {
      await this.client.login(process.env.DISCORD_TOKEN)
    } catch (err) {
      setTimeout((): void => {
        this.login()
      }, 30000)
    }
  }

  public async updateFAQ (): Promise<void> {
    if (process.env.NODE_ENV === 'development') return
    const messages = [
      {
        embed: new Discord.RichEmbed()
          .setTitle('What Cemu version should I use?')
          .setColor(0xff0000)
          .setThumbnail('http://compat.cemu.info/w/CemuLogo2.png')
          .setDescription(
            'If you have a Nvidia GPU, you should use [Cemu version 1.9.1](http://cemu.info/releases/cemu_1.9.1.zip).\n' +
              'AMD users should use [Cemu version 1.7.5](http://cemu.info/releases/cemu_1.7.5.zip).\n' +
              'You can and should also grab the latest [Cemuhook version](https://sshnuke.net/cemuhook/), because it will fix missing fonts (Nvidia only).'
          )
          .addField(
            'Get our preconfigured Cemu builds',
            'They include all unlockable building blocks, all Amiibos, some shaders and all top starred SMMDB courses.\n\n' +
              '[Cemu 1.9.1 for Nvidia](https://mega.nz/#!XZNhmIYQ!1fRLg77a8r2E-1eZJGAJ0W0CSXHQgnjDeXkAporZhUU)\n' +
              '[Cemu 1.7.4 for AMD](https://mega.nz/#!bJ0EWbbC!5YvhH9HGPZXdcD_AO8xkzA4mVUjw16Rsd_2ATYvsx1M)'
          )
          .addField(
            'Do I need a transferable shader cache?',
            "The game has very few shaders, so don't waste your time searching for it and just play."
          )
      },
      {
        embed: new Discord.RichEmbed()
          .setTitle(
            'Where do I download a Super Mario Maker wud/iso/rom and how do I install it?'
          )
          .setColor(0x00ff00)
          .setThumbnail('http://smmdb.ddns.net/img/coursebot.png')
          .setDescription(
            'You can download Super Mario Maker [right here](https://mega.nz/#F!3HJxhaAJ!PYcAR8Ur0gp3VJ1vurLQFg)\n' +
              '\n' +
              '*Warning: please only download games that you own legally*\n' +
              '\n' +
              'The link includes the game itself and the latest update. You will have to use Cemu\'s "install update" feature to install the update.'
          )
      },
      {
        embed: new Discord.RichEmbed()
          .setTitle('Can I play online?')
          .setColor(0x0000ff)
          .setThumbnail('http://smmdb.ddns.net/img/courses.png')
          .setDescription(
            'No. When you do anything in game related with online gaming, Cemu will just hang and crash.\n' +
              '*Disclaimer: Cemu 1.11.1 will support native online play. You will need a console and dump a lot of files to do so and we cannot give any support for it*' +
              '\n\nYou can however edit your save file with [Cemu SMMDB](https://github.com/Tarnadas/cemu-smmdb) or you can do it manually. Just visit [SMMDB](http://smmdb.ddns.net) and download the course you want. ' +
              'There is also a [Video Guide](https://youtu.be/wF2f2ScIZUY).\n' +
              'If you want to upload a course on the website, you would have to compress the course with a tool like 7zip or WinRAR (rar files are currently broken). ' +
              "The folder structure of the compressed file must start with a 'course###' folder and it can also contain multiple courses.\n\n"
          )
          .addField(
            "I extracted the courses into the right Mario Maker directory within \\mlc\\emulatorSave\\ but in-game they don't show up, what did I do wrong?",
            'You can only replace courses that do already exist (in your save game)! ' +
              'Simply putting the folder titled "course011" into this folder when all you have is course000 and course001 does not work. ' +
              'You need to load Super Mario Maker, go into "create", then save a new course, and then replace the file.'
          )
          .addField(
            'I was uploading a level, but it uploaded the wrong one',
            "Nope, that's in fact the course you were uploading. The numbering in your save folder can be complicated because of how the game treats reordering. " +
              'If you want to restore proper course numbering, you can just load your save with Cemu SMMDB'
          )
      },
      {
        embed: new Discord.RichEmbed()
          .setTitle('Why am i unable to use my mouse?')
          .setColor(0xffff00)
          .setThumbnail('http://smmdb.ddns.net/img/profile.png')
          .setDescription(
            "Go to input settings and make sure, that you selected Wii U Gamepad. Otherwise the Mouse won't be able to function as a touch cursor."
          )
          .addField(
            'When I die I get back into the editor, is there another way to play the levels?',
            'To start levels go into Creator-Mode, Press Start, now go into Course Bot. Now you can play levels the regular way without going into Building-Mode every time you die.'
          )
          .addField(
            "I can't type the name of my level when I first try and save it! What do I do?",
            'Press Ctrl+Alt+Del and select "cancel".'
          )
          .addField(
            'What controllers or other sources of inputs are supported?',
            'Cemu natively supports Keyboard, "Any USB controller" and XInput since v1.9. Using a Xbox One or Xbox 360 controller is very easy to set up and I highly recommend them.'
          )
      },
      {
        embed: new Discord.RichEmbed()
          .setTitle('How playable is Super Mario Maker with Cemu?')
          .setColor(0xff00ff)
          .setThumbnail('http://smmdb.ddns.net/img/wiiu.png')
          .setDescription(
            "With a Nvidia GPU and Cemuhook it is almost perfect. With an AMD GPU, a lot of the fonts will be missing and course thumbnails won't be properly generated.\n" +
              'There might also be very few sound errors.'
          )
      },
      {
        embed: new Discord.RichEmbed()
          .setTitle('Can I use custom texture packs?')
          .setColor(0x00ffff)
          .setThumbnail('http://mariomods.net/img/logo.png')
          .setDescription(
            '[There is a forum dedicated for Super Mario Maker texture packs](http://mariomods.net)\n' +
              '• Ensure you have an unpacked version of Super Mario Maker, with the latest updates.\n' +
              '• I recommend you copy your unpacked game to another place before doing this, so you have an unmodified and a modified directory\n' +
              '\n' +
              '  • Download the Texture Pack you wish to use, and extract it from the zip.\n' +
              '  • Copy the folders you have after extracting into your unpacked game folder, merging any files you need to.\n' +
              "  • Now, you should be done, when you launch your game's RPX through cemu, it will be modified with the texturepack. If for some reason it didn't, you can delete the modifed game and start over."
          )
      }
    ]
    if (!this.faqChannel) throw new Error()
    const channelMessages: any[] = (await this.faqChannel.fetchMessages({
      limit: messages.length
    }))
      .array()
      .reverse()
    for (let i in channelMessages) {
      await channelMessages[i].edit(messages[i])
    }
  }

  public uploadCourse (courses: any[], account: any): void {
    if (process.env.NODE_ENV === 'development') return
    if (courses.length === 0) return
    const isMany = courses.length > 1
    const ownerName = account.username
    const messages = []
    messages[0] = isMany
      ? `New <:smm:352479783474692097> courses have been uploaded by ${ownerName}:`
      : `A new <:smm:352479783474692097> course has been uploaded by ${ownerName}`
    let messageIndex = 0
    for (let i in courses) {
      const course = courses[i]
      let autoScroll = `${
        course.autoScroll === 1
          ? '<:turtle:334989248526811146>'
          : course.autoScroll === 2
            ? '<:rabbit:334989248266633216>'
            : course.autoScroll === 3
              ? '<:cheetah:334989248191004673>'
              : ''
      }`
      autoScroll += `${
        course.autoScrollSub === 1
          ? '<:turtle:334989248526811146>'
          : course.autoScrollSub === 2
            ? '<:rabbit:334989248266633216>'
            : course.autoScrollSub === 3
              ? '<:cheetah:334989248191004673>'
              : ''
      }`
      let append = `
      ${
        course.gameStyle === 0
          ? '    <:smb:334989248593920000>'
          : course.gameStyle === 1
            ? '    <:smb3:334989248749109248>'
            : course.gameStyle === 2
              ? '    <:smw:334989248539262978>'
              : '    <:nsmbu:334989248975470592>'
      } ${course.title} by ${course.maker}${autoScroll ? ` ${autoScroll}` : ''}`
      if (messages[messageIndex].length + append.length > 2000) {
        messages.push('')
        messageIndex++
      }
      messages[messageIndex] += append
    }
    if (!this.channel) throw new Error()
    for (let i in messages) {
      this.channel.send(messages[i])
    }
  }

  public uploadCourse64 (course: any, account: any): void {
    if (process.env.NODE_ENV === 'development') return
    ;(this.channel as any).send(
      `A new <:sm64m:352480143706685442> course has been uploaded by ${
        account.username
      }\n          ${course.title}`
    )
  }

  public updateCourse (course: any, account: any): void {
    if (process.env.NODE_ENV === 'development') return
    const ownerName = account.username
    let autoScroll = `${
      course.autoScroll === 1
        ? '<:turtle:334989248526811146>'
        : course.autoScroll === 2
          ? '<:rabbit:334989248266633216>'
          : course.autoScroll === 3
            ? '<:cheetah:334989248191004673>'
            : ''
    }`
    autoScroll += `${
      course.autoScrollSub === 1
        ? '<:turtle:334989248526811146>'
        : course.autoScrollSub === 2
          ? '<:rabbit:334989248266633216>'
          : course.autoScrollSub === 3
            ? '<:cheetah:334989248191004673>'
            : ''
    }`
    const message = `A course has been updated by ${ownerName}
      ${
        course.gameStyle === 0
          ? '    <:smb:334989248593920000>'
          : course.gameStyle === 1
            ? '    <:smb3:334989248749109248>'
            : course.gameStyle === 2
              ? '    <:smw:334989248539262978>'
              : '    <:nsmbu:334989248975470592>'
      } ${course.title} by ${course.maker}${autoScroll ? ` ${autoScroll}` : ''}`
    if (!this.channel) throw new Error()
    this.channel.send(message)
  }
}
