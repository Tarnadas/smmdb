const initialCoursesToBeDisplayed = 20;
const additionalCoursesToBeDisplayed = 10;
const scrollOffset = 80;

export default function CourseData() {

    this.downloadButton = document.createElement('div');
    this.downloadButton.className = 'course-template-button-wrapper';
    this.downloadButton.innerHTML =
        "<div class='course-template-button'>" +
        "<a><img class='icon' title='Download' src='/img/download.png' /></a>" +
        "</div>";

    this.collapseButton = document.createElement('div');
    this.collapseButton.className = 'course-template-button-wrapper';
    let collapseInner = document.createElement('div');
    collapseInner.className = 'course-template-button';
    collapseInner.innerHTML = "<img class='icon link' title='Show/Hide' src='/img/menu.png' />";
    this.collapseEvent = (event) => {
        let div = event.target.parentNode.parentNode.parentNode.parentNode.children[1];
        let height = div.style['max-height'];
        if (height === "0px") {
            div.style['max-height'] = "800px";
            div.style['padding-bottom'] = "12px";
        } else {
            div.style['max-height'] = "0px";
            div.style['padding-bottom'] = "0px";
        }
        for (let i = 0; i < div.children.length; i++) {
            if (div.children[i].className === 'youtube-container') {
                if (div.children[i].children[0].src === window.location.href) {
                    let youtubeId = window.courses.courses[`${event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('course-id')}`].videoid;
                    div.children[i].children[0].src = "http://www.youtube.com/embed/" + youtubeId + this.youtubePlayerSetting;
                }
                break;
            }
        }
    };
    this.collapseButton.appendChild(collapseInner);

    this.downloadsIcon = document.createElement('div');
    this.downloadsIcon.className = 'course-template-button-wrapper';
    let downloadsButton = document.createElement('div');
    downloadsButton.className = 'course-template-button small-button';
    downloadsButton.innerHTML = "<img class='icon link' title='Downloads' src='/img/downloads.png' />";
    let downloadsAmount = document.createElement('div');
    downloadsAmount.className = 'amount';
    downloadsAmount.innerHTML = '0';
    this.downloadsIcon.appendChild(downloadsButton);
    this.downloadsIcon.appendChild(downloadsAmount);

    this.starredIcon = document.createElement('div');
    this.starredIcon.className = 'course-template-button-wrapper';
    let starredButton = document.createElement('div');
    starredButton.className = 'course-template-button small-button';
    let starredIcon = document.createElement('img');
    starredIcon.className = 'icon starred';
    starredIcon.title = 'Stars';
    starredIcon.src = '/img/unstarred.png';
    starredButton.appendChild(starredIcon);
    let starredAmount = document.createElement('div');
    starredAmount.className = 'amount';
    starredAmount.innerHTML = '0';
    this.starredIcon.appendChild(starredButton);
    this.starredIcon.appendChild(starredAmount);

    this.completedIcon = document.createElement('div');
    this.completedIcon.className = 'course-template-button-wrapper';
    let completedButton = document.createElement('div');
    completedButton.className = 'course-template-button small-button';
    let completedIcon = document.createElement('img');
    completedIcon.className = 'icon completed';
    completedIcon.title = 'Completions';
    completedIcon.src = '/img/uncompleted.png';
    completedButton.appendChild(completedIcon);
    let completedAmount = document.createElement('div');
    completedAmount.className = 'amount';
    completedAmount.innerHTML = '0';
    this.completedIcon.appendChild(completedButton);
    this.completedIcon.appendChild(completedAmount);

    this.likedCountIcon = document.createElement('div');
    this.likedCountIcon.className = 'original-author';
    this.likedCountIcon.innerHTML =
        "<div class='course-template-button small-button'>" +
        "<img class='icon' title='Wii U Stars' src='/img/starred.png' />" +
        "</div>";
    let likedAmount = document.createElement('div');
    likedAmount.className = 'amount starred';
    this.likedCountIcon.appendChild(likedAmount);

    this.triedCountIcon = document.createElement('div');
    this.triedCountIcon.className = 'original-author';
    this.triedCountIcon.innerHTML =
        "<div class='course-template-button small-button'>" +
        "<img class='icon' title='Wii U Plays' src='/img/downloads.png' />" +
        "</div>";
    let triedAmount = document.createElement('div');
    triedAmount.className = 'amount downloads';
    this.triedCountIcon.appendChild(triedAmount);

    this.clearRateIcon = document.createElement('div');
    this.clearRateIcon.className = 'original-author';
    this.clearRateIcon.innerHTML =
        "<div class='course-template-button small-button'>" +
        "<img class='icon' title='Wii U Stars' src='/img/completed.png' />" +
        "</div>";
    let clearRateAmount = document.createElement('div');
    clearRateAmount.className = 'amount completed';
    this.clearRateIcon.appendChild(clearRateAmount);

    this.submitButton =
        "<div class='submit smm-button' onclick='courseData.updateCourse(this)'>" +
            "<div class='smm-icon'><img src='/img/submit.png' /></div>" +
            "<div class='link'>Save</div>" +
        "</div>";
    this.deleteButton =
        "<div class='delete smm-button' onclick='util.showDeleteMessage'>" +
            "<div class='smm-icon'><img src='/img/delete.png' /></div>" +
            "<div class='link'>Delete</div>" +
        "</div>";
    this.youtubePlayer =
        "<div class='youtube-container' address=''>" +
            "<iframe class='youtube-player' type='text/html' width='640' height='360' frameborder='0' allowfullscreen />" +
        "</div>";
    this.youtubePlayerSetting = "?disablekb=1&iv_load_policy=3&rel=0&showinfo=0";

}

CourseData.prototype = {

    createHtml: async function() {

        for (let i = 0, j = 0; i < window.courses.order.length; i++, j++) {

            let currentCourse = window.courses.courses[window.courses.order[i]];
            if (!window.userId || currentCourse.owner !== window.userId) {
                this.buildCourseHtml(currentCourse);
            } else {
                this.buildOwnCourseHtml(currentCourse);
            }

            if (j > initialCoursesToBeDisplayed) {
                await (new Promise((resolve) => {
                    window.onscroll = () => {
                        if ((window.innerHeight + window.scrollY) + scrollOffset >= document.body.offsetHeight) {
                            resolve();
                        }
                    };
                }));
                j -= additionalCoursesToBeDisplayed;
            }

        }

        $('.icon:not(.interactive-tooltip):not(.tooltipstered)').tooltipster(); // TODO

    },

    buildCourseHtml: function (currentCourse) {

        let element = document.createElement('div');
        element.className = 'course-template';
        element.setAttribute('course-id', currentCourse.id);
        window.courseIdToElement[currentCourse.id] = element;

        let preview = document.createElement('div');
        preview.className = 'course-template-preview';
        preview.innerHTML =
            "<div class='circle topright'></div>" +
            "<div class='circle topleft'></div>" +
            "<div class='circle bottomright'></div>" +
            "<div class='circle bottomleft'></div>";
        element.appendChild(preview);

        let levelType = document.createElement('div');
        levelType.className = 'leveltype';
        preview.appendChild(levelType);
        let levelTypeImage = document.createElement('img');
        levelType.appendChild(levelTypeImage);
        switch (currentCourse.leveltype) {
            case 0:
                levelTypeImage.src = '/img/nsmbu.png';
                break;
            case 1:
                levelTypeImage.src = '/img/smw.png';
                break;
            case 2:
                levelTypeImage.src = '/img/smb3.png';
                break;
            case 3:
                levelTypeImage.src = '/img/smb.png';
        }

        let courseName = document.createElement('div');
        courseName.className = 'course-name';
        courseName.innerHTML = `${currentCourse.title} by ${currentCourse.ownername}`;
        preview.appendChild(courseName);

        let courseMedals = document.createElement('div');
        courseMedals.className = 'course-medals-wrapper';
        courseMedals.innerHTML = `<div class='course-medals icon' title='Reputation'><img src='/img/bronze.png' />${currentCourse.points}</div>`;
        preview.appendChild(courseMedals);

        let collapse = this.collapseButton.cloneNode(true);
        collapse.addEventListener('click', this.collapseEvent);
        preview.appendChild(collapse);

        let download = this.downloadButton.cloneNode(true);
        download.children[0].children[0].href = `/courses/${currentCourse.id}`;
        preview.appendChild(download);

        let completedIcon = this.completedIcon.cloneNode(true);
        if (currentCourse.completedself === 1) {
            completedIcon.children[0].children[0].src = '/img/completed.png';
        }
        completedIcon.children[1].innerHTML = +currentCourse.completed;
        preview.appendChild(completedIcon);

        let downloadsIcon = this.downloadsIcon.cloneNode(true);
        downloadsIcon.children[1].innerHTML = +currentCourse.downloads;
        preview.appendChild(downloadsIcon);

        let starredIcon = this.starredIcon.cloneNode(true);
        if (currentCourse.starredself === 1) {
            starredIcon.children[0].children[0].src = '/img/starred.png';
        }
        starredIcon.children[1].innerHTML = +currentCourse.stars;
        preview.appendChild(starredIcon);

        let details = document.createElement('div');
        details.className = 'course-template-details';
        details.style['max-height'] = "0px";
        details.style['padding-bottom'] = "0px";
        element.appendChild(details);

        if (currentCourse.hasimage === 1) {
            let courseThumbnail = document.createElement('div');
            courseThumbnail.className = 'course-thumbnail';
            details.appendChild(courseThumbnail);
            let courseThumbnailImg = document.createElement('img');
            courseThumbnailImg.className = 'course-thumbnail';
            courseThumbnailImg.src = `/img/courses/thumbnails/${currentCourse.id}.pic`; // TODO .pic ...
            courseThumbnail.appendChild(courseThumbnailImg);
        }

        if (!!currentCourse.coursetype && !!currentCourse.nintendoid) {
            let parsedData = document.createElement('div');
            parsedData.className = 'parsed-data';
            parsedData.innerHTML =
                "<div class='original-author-mii'>" +
                "<a target='_blank' class='link' href='" + currentCourse.originalauthorurl + "'>" +
                "<img src='" + currentCourse.originalauthormii + "' /></a>" +
                "</div>";
            details.appendChild(parsedData);

            let originalAuthor = document.createElement('div');
            originalAuthor.className = 'original-author';
            originalAuthor.innerHTML =
                currentCourse.originalauthor +
                "<div class='nintendo-id'>" +
                "<a target='_blank' class='link' href='https://supermariomakerbookmark.nintendo.net/courses/" + currentCourse.nintendoid + "'>" +
                "<div>" + currentCourse.nintendoid + "</div>" +
                "</a>" +
                "</div>";
            parsedData.appendChild(originalAuthor);

            if (!!currentCourse.coursetype && !!currentCourse.nintendoid) {
                let likedCount = this.likedCountIcon.cloneNode(true);
                likedCount.children[1].innerHTML = currentCourse.likedcount;
                originalAuthor.appendChild(likedCount);
            }

            if (!!currentCourse.coursetype && !!currentCourse.nintendoid) {
                let triedCount = this.triedCountIcon.cloneNode(true);
                triedCount.children[1].innerHTML = currentCourse.triedcount;
                originalAuthor.appendChild(triedCount);
            }

            if (!!currentCourse.coursetype && !!currentCourse.nintendoid) {
                let clearRate = this.clearRateIcon.cloneNode(true);
                clearRate.children[1].innerHTML = currentCourse.clearrate + "%";
                originalAuthor.appendChild(clearRate);
            }
        }

        let divDifficulty = document.createElement('div');
        divDifficulty.className = 'uploadoption';
        let difficulty = "N/A";
        switch (currentCourse.difficulty) {
            case 0:
                difficulty = "Easy";
                break;
            case 1:
                difficulty = "Normal";
                break;
            case 2:
                difficulty = "Expert";
                break;
            case 3:
                difficulty = "Super Expert";
                break;
            case 4:
                difficulty = "Mixed";
                break;
            default:
        }
        divDifficulty.innerHTML = `<span>Difficulty:</span><br><div>${difficulty}</div>`;
        details.appendChild(divDifficulty);

        let divUpdateReq = document.createElement('div');
        divUpdateReq.className = 'uploadoption';
        let updateReq = "N/A";
        if (currentCourse.updatereq) {
            updateReq = "Yes";
        } else {
            updateReq = "No";
        }
        divUpdateReq.innerHTML = `<span>Content Update required?</span><br><div>${updateReq}</div>`;
        details.appendChild(divUpdateReq);

        let divHasThumbnail = document.createElement('div');
        divHasThumbnail.className = 'uploadoption';
        let hasThumbnail = "N/A";
        if (currentCourse.hasthumbnail) {
            hasThumbnail = "Yes";
        } else {
            hasThumbnail = "No";
        }
        divHasThumbnail.innerHTML = `<span>Has ingame thumbnail?</span><br><div>${hasThumbnail}</div>`;
        details.appendChild(divHasThumbnail);

        if (!!currentCourse.videoid) {
            let youTubeContainer = document.createElement('div');
            youTubeContainer.className = 'youtube-container';
            youTubeContainer.innerHTML = "<iframe class='youtube-player' width='640' height='360' src='' frameborder='0' allowfullscreen></iframe>";
            details.appendChild(youTubeContainer);
        }

        window.divCourses.appendChild(element);

    },

    // TODO
    buildOwnCourseHtml: function (currentCourse, prepend) {

        let thumbnailPath = "";
        if (currentCourse.hasimage === 1) {
            thumbnailPath = "/img/courses/thumbnails/" + currentCourse.id + ".pic";
        }

        let element = $(
            "<div class='course-template'>" +
            "<div class='course-template-preview'><div class='circle topright'></div><div class='circle topleft'></div><div class='circle bottomright'></div><div class='circle bottomleft'></div><div class='leveltype'><img></img></div></div>" +
            "<div class='course-template-details' style='display:none;'>" +
            "<div class='course-thumbnail'><img class='course-thumbnail' src='" + thumbnailPath + "' /></div>" +
            "<div class='course-reupload course-dropzone'><div class='dz-message' data-dz-message><span>Drag and drop or click to reupload course</span></div></div>" +
            "<div class='image-upload course-dropzone' style='float:right'><div class='dz-message' data-dz-message><span>Drag and drop or click to upload image</span></div></div>" +
            "<form class='course-update' autocomplete='off'><input class='levelid' type='hidden' name='levelid' value=''>" +

            "<div class='uploadoption course-type'>Course type:</br><select name='coursetype'>" +
            "<option value='0'>Own Creation</option>" +
            "<option value='1'>Recreation</option>" +
            "<option value='2'>Wii U Dump</option>" +
            "</select></div>" +

            "<div class='recreation' style='display:none;'>" +
            "<div class='uploadoption'>" +
            "<span>Nintendo ID:</span></br>" +
            "<div class='nintendoid selectcontent'><input type='text' name='nintendoid'></div>" +
            "</div>" +
            "</div>" +

            "<div class='own'>" +
            "<div class='uploadoption'>" +
            "<span>Level name:</span></br>" +
            "<div class='levelname selectcontent'><input type='text' name='levelname'></div>" +
            "</div>" +
            "<div class='uploadoption'>" +
            "<span>Level type:</span></br>" +
            "<div class='level-type selectcontent'><select size='5' name='leveltype'>" +
            "<option value='0'>New Super Mario Bros U</option>" +
            "<option value='1'>Super Mario World</option>" +
            "<option value='2'>Super Mario Bros 3</option>" +
            "<option value='3'>Super Mario Bros</option>" +
            "<option value='4'>Mixed</option>" +
            "</select></div>" +
            "</div>" +
            "<div class='uploadoption'>" +
            "<span>Difficulty:</span></br>" +
            "<div class='leveldifficulty selectcontent'><select size='5' name='leveldifficulty'>" +
            "<option value='0'>Easy</option>" +
            "<option value='1'>Normal</option>" +
            "<option value='2'>Expert</option>" +
            "<option value='3'>Super Expert</option>" +
            "<option value='4'>Mixed</option>" +
            "</select></div>" +
            "</div>" +
            "<div class='uploadoption'>" +
            "<span>Content update required?</span></br>" +
            "<div class='levelupdate selectcontent'><select size='2' name='levelupdate'>" +
            "<option value='1'>Yes</option>" +
            "<option value='0'>No</option>" +
            "</select></div>" +
            "</div>" +
            "<div class='uploadoption'>" +
            "<span>Has ingame thumbnail? </span><div class='very-small-button'><img class='help-icon interactive-tooltip' src='/img/help.png' /><span class='tooltip_content'>Click <a class='link' target='_blank' href='https://www.reddit.com/r/CemuMarioMaker/comments/52pwa6/guide_for_custom_thumbnails_for_your_courses/'>here</a> for more info how to do this</span></div></br>" +
            "<div class='levelthumbnail selectcontent'><select size='2' name='levelthumbnail'>" +
            "<option value='1'>Yes</option>" +
            "<option value='0'>No</option>" +
            "</select></div>" +
            "</div>" +
            "<div class='uploadoption'>" +
            "<span>Youtube ID: </span><div class='very-small-button'><img class='help-icon' title='YOUTUBE_ID or youtube.com/watch?v=YOUTUBE_ID or youtu.be/YOUTUBE_ID' src='/img/help.png' /></div></br>" +
            "<div class='levelvideoid selectcontent'><input type='text' name='levelvideoid'></div>" +
            "</div>" +
            "<div class='uploadoption'>" +
            "<span>Is package?</span></br>" +
            "<div class='levelpackage selectcontent'><select size='2' name='levelpackage'>" +
            "<option value='1'>Yes</option>" +
            "<option value='0'>No</option>" +
            "</select></div>" +
            "</div>" +
            "</div>" +

            "<div class='uploadbutton'>" +
            "</div></form>" +
            this.submitButton +
            this.deleteButton +
            "</div>" +
            "</div>"
        );

        $(element).attr('course-id', currentCourse.id);
        let reputation = currentCourse.points;
        if (window.location.href.includes("upload")) {
            $(element).find('.course-template-preview').append(`<div class='course-name'>${currentCourse.title}</div>`);
        } else {
            $(element).find('.course-template-preview').append(`<div class='course-name'>${currentCourse.title} by ${currentCourse.ownername}</div>`);
            $(element).find('.course-template-preview').append(
                "<div class='course-medals-wrapper'>" +
                    "<div class='course-medals icon' title='Reputation'><img src='/img/bronze.png' />" + reputation + "</div>" +
                "</div>"
            );
        }

        $(element).find('.course-template-preview').append(this.collapseButton[0].outerHTML);

        $(this.downloadButton).find('.link').attr('href', '/courses/' + currentCourse.id);
        $(element).find('.course-template-preview').append(this.downloadButton[0].outerHTML);

        $(this.completedIcon).find('.amount').html(currentCourse.completed);
        if (currentCourse.completedself === 1) {
            $(this.completedIcon).find('.icon').attr('src', '/img/completed.png');
        } else {
            $(this.completedIcon).find('.icon').attr('src', '/img/uncompleted.png');
        }
        $(element).find('.course-template-preview').append(this.completedIcon[0].outerHTML);

        $(this.downloadsIcon).find('.amount').html(currentCourse.downloads);
        $(element).find('.course-template-preview').append(this.downloadsIcon[0].outerHTML);

        $(this.starredIcon).find('.amount').html(currentCourse.stars);
        if (currentCourse.starredself === 1) {
            $(this.starredIcon).find('.icon').attr('src', '/img/starred.png');
        } else {
            $(this.starredIcon).find('.icon').attr('src', '/img/unstarred.png');
        }
        $(element).find('.course-template-preview').append(this.starredIcon[0].outerHTML);

        $(element).find('.levelid').attr("value", currentCourse.id);
        $(element).find('.course-type select option[value=' + currentCourse.coursetype + ']').attr('selected','selected');
        $(element).find('.nintendoid input').attr("value", currentCourse.nintendoid);
        if (currentCourse.coursetype !== 0) {
            $(element).find('.recreation').attr("style", "");
        }
        $(element).find('.levelname input').attr("value", currentCourse.title);
        $(element).find('.level-type select option[value=' + currentCourse.leveltype + ']').attr('selected','selected');
        $(element).find('.leveldifficulty select option[value=' + currentCourse.difficulty + ']').attr('selected','selected');
        $(element).find('.levelupdate select option[value=' + currentCourse.updatereq + ']').attr('selected','selected');
        $(element).find('.levelthumbnail select option[value=' + currentCourse.hasthumbnail + ']').attr('selected','selected');
        $(element).find('.levelvideoid input').attr("value", currentCourse.videoid);
        $(element).find('.levelpackage select option[value=' + currentCourse.ispackage + ']').attr('selected','selected');
        switch (currentCourse.leveltype) {
            case 0:
                $(element).find('.leveltype').children('img').attr('src', '/img/nsmbu.png');
                break;
            case 1:
                $(element).find('.leveltype').children('img').attr('src', '/img/smw.png');
                break;
            case 2:
                $(element).find('.leveltype').children('img').attr('src', '/img/smb3.png');
                break;
            case 3:
                $(element).find('.leveltype').children('img').attr('src', '/img/smb.png');
        }
        let youtubeId = currentCourse.videoid;
        if (!!youtubeId) {
            $(this.youtubePlayer).attr("address", "http://www.youtube.com/embed/" + youtubeId + this.youtubePlayerSetting);
            $(element).find('.course-template-details').append(this.youtubePlayer[0].outerHTML);
        }

        if (!!prepend) {
            let e = document.createElement('div');
            e.className = "course-template";
            e.innerHTML = element[0].innerHTML;
            document.querySelector('.courses').prependChild(e);
        } else {
            let e = document.createElement('div');
            e.className = "course-template";
            e.innerHTML = element[0].innerHTML;
            document.querySelector('.courses').appendChild(e);
        }

        return element[0];

    },

    updateCourse: function(element) {

        $.ajax({
            url: '/course-update',
            type: 'post',
            data: $(element).parent().children('form.course-update').serialize(),
            success: function(data){
                $(element).parent().parent().find('.course-name').html(data);
                alert("Saved");
            },
            error: function(jqXHR, textStatus) {
                if (textStatus === "timeout") {
                    console.log("Server timed out");
                } else {
                    console.log(jqXHR.responseText);
                }
            },
            timeout: 3000
        });

    },

    deleteCourse: function(element) {

        let courseId = $(element).parent().attr("course-id");
        $.ajax({
            url: '/course-delete',
            type: 'post',
            data: 'id=' + courseId,
            success: function() {
                util.hideDeleteMessage();
                $(`.${courseId}`).remove();
                // TODO courses variable
            },
            error: function(jqXHR, textStatus) {
                if (textStatus === "timeout") {
                    console.log("Server timed out");
                } else {
                    console.log(jqXHR.responseText);
                }
            },
            timeout: 3000
        });

    },

    star: function(event) {

        event.preventDefault();
        let courseId = $(event.target).closest(".course-template").attr("course-id");
        let dostar = "1";
        try {
            if (window.courses.courses[$(event.target).closest(".course-template").attr("course-id")].starredself === 1) {
                dostar = "0";
            }
        } catch (err) {
            if ($(event.target).closest(".course-template").attr("starred") === "1") {
                dostar = "0";
            }
        }
        $.ajax({
            url: '/star',
            type: 'post',
            data: `courseid=${courseId}&dostar=${dostar}`,
            success: function(data){
                let response = JSON.parse(data);
                if (!!response.starredself) {
                    if (response.starredself === 1) {
                        $(event.target).attr("src", "/img/starred.png");
                        let $amount = $(event.target).closest(".course-template-button-wrapper").children(".amount");
                        let amount = parseInt($amount.html()) + 1;
                        $amount.html("" + amount);
                    } else if (response.starredself === 0) {
                        $(event.target).attr("src", "/img/unstarred.png");
                        let $amount = $(event.target).closest(".course-template-button-wrapper").children(".amount");
                        let amount = parseInt($amount.html()) - 1;
                        $amount.html("" + amount);
                    }
                    try {
                        window.courses.courses[$(event.target).closest(".course-template").attr("course-id")].starredself = response.starredself;
                    } catch (err) {
                        $(event.target).closest(".course-template").attr("starred", parseInt(data));
                    }
                }
            },
            error: function(jqXHR, textStatus) {
                if (textStatus === "timeout") {
                    console.log("Server timed out");
                } else {
                    console.log(jqXHR.responseText);
                }
            },
            timeout: 3000
        });

    },

    completed: function(event) {

        event.preventDefault();
        let courseId = $(event.target).closest(".course-template").attr("course-id");
        let docomplete = "1";
        try {
            if (courses.courses[$(event.target).closest(".course-template").attr("course-id")].completedself === 1) {
                docomplete = "0";
            }
        } catch (err) {
            if ($(event.target).closest(".course-template").attr("completed") === "1") {
                docomplete = "0";
            }
        }
        $.ajax({
            url: '/complete',
            type: 'post',
            data: 'courseid=' + courseId + '&docomplete=' + docomplete,
            success: function (data) {
                let response = JSON.parse(data);
                if (!!response.completedself) {
                    if (response.completedself === 1) {
                        $(event.target).attr("src", "/img/completed.png");
                        let $amount = $(event.target).closest(".course-template-button-wrapper").children(".amount");
                        let amount = parseInt($amount.html()) + 1;
                        $amount.html("" + amount);
                    } else if (response.completedself === 0) {
                        $(event.target).attr("src", "/img/uncompleted.png");
                        let $amount = $(event.target).closest(".course-template-button-wrapper").children(".amount");
                        let amount = parseInt($amount.html()) - 1;
                        $amount.html("" + amount);
                    }
                    try {
                        courses.courses[$(event.target).closest(".course-template").attr("course-id")].completedself = response.completedself;
                    } catch (err) {
                        $(event.target).closest(".course-template").attr("completed", parseInt(data));
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 404) {
                    alert("Page not found");
                } else {
                    if (textStatus === "timeout") {
                        alert("Server timed out");
                    } else {
                        alert("You are not logged in");
                    }
                }
            },
            timeout: 3000
        })
    }

};