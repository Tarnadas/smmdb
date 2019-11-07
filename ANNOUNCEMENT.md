Hey everyone,

I am pleased to finally announce that [SMMDB](https://smmdb.net) now supports uploading Super Mario Maker 2 courses.

SMMDB is the only cross console/emulator sharing platform for Super Mario Maker courses and already has more than 12k uploaded SMM1 courses.
Uploading is really simple via the website. You just need to sign in with Google and can drag and drop course dumps.
In fact most courses for SMM1 are dumped from real Nintendo servers.

For SMM2 I already uploaded all courses which have been dumped in [this thread](https://gbatemp.net/threads/super-mario-maker-2-top-weekly-course-dumps.542180/).
There are still many features that I want to implement to make the platform much better.
This is just an MVP, so please keep this in mind.

I want to explain a little more in depth how this works.

For SMM1 there has been made several efforts to reverse engineer the level format.
However afaik it has never been finished and I also haven't had the enthusiasm to complete it.
I once wrote a library to facilitaty SMM1 level deserialization, [which can be found at NPM](https://www.npmjs.com/package/cemu-smm).
It also supports helper functions to reserialize levels into another format known as Protocol Buffer,
which is a programming language independent serialization technique. Courses are stored in this intermediate format on my server.
The original course is not stored, but it can be restored by deserializing the Protocol Buffer format and reserializing it into
Nintendo compatible files. The Protocol Buffer files are also way smaller than the original files.
However any information that has not been reverse engineered has been dropped.
This especially includes Mii data and probably several other bits.
This data isn't that relevant, if you just want to download and play them.
However there is a project called [Pretendo](https://discord.gg/6hTE8dq), who reverse engineer Nintendo servers.
Someone finally managed to add basic functionality to a private SMM1 server, which will let you play 100 Mario Challenge.
The dropped metadata I was talking about might be crucial for such a server, so it needs to be faked as good as possible.
If you're interested in this project, you should definitely visit [their website](https://smmserver.github.io/).

For SMM2 I wrote a new API backend in Rust.
The API is publicly available and will be documented soon, which can be found [here](https://api.smmdb.net).
One of the main features I am very proud of is automatic duplicate detection. For SMM1 courses the duplication problem
has become so tremendous, that I once had to write a script, which can clear such courses from the database.
It needs to be run manually from time to time.
Now for SMM2 courses this check will be done at request time, which means it immediately gives you feedback whether a duplicate course has been found.
This check needs several processing power, but Rust is known for having a comparable performance with C++.
I also rewrote the serialization library in Rust. It can either be used natively by Rust, but it can also be compiled to WebAssembly,
which means it runs in Node.js and in the browser.
The SMM2 level format has been almost completely reverse engineered and documented [right here](https://github.com/0Liam/smm2-documentation) by several people.
This is not my effort! I just rewrote the serialization and encryption for my use case.

You might know that Tinfoil already supports uploading and downloading SMM2 courses.
However Tinfoil is not cross platform and can only be used with Switch homebrew.

For SMM1 there exists a [Cemu save file editor](https://github.com/Tarnadas/cemu-smmdb).
The same effort should be done for SMM2 for the [Yuzu emulator](https://yuzu-emu.org/).
For Switch homebrew the [4TU](https://fortheusers.org/) community came in contact with me, because they want to
build a homebrew app. This can be done once I documented the API.
I also want to rewrite the website with Next.js, so if you have any suggestions
