import Util from './util'
import Session from './session'
import CourseData from './coursedata'
import ProfileData from './profiledata'

let util        = new Util();
let session     = new Session();
let courseData  = new CourseData();
let profileData = new ProfileData();

window.util        = util;
window.session     = session;
window.courseData  = courseData;
window.profileData = profileData;

window.courseIdToElement = {};

// TODO replace jQuery with standard javascript
(async () => {
    let googleApi = document.createElement('script');
    console.log("loading");
    googleApi.onload = () => {
        console.log("on load");
        window.gapi.load('auth2', () => {
            console.log("loaded");
            window.auth2 = window.gapi.auth2.init({
                client_id: '899493559187-bnvgqj1i8cnph7ilkl4h261836skee25.apps.googleusercontent.com',
                cookiepolicy: 'single_host_origin',
                scope: 'profile email'
            }).then(() => {
                console.log("then");
                let auth2 = window.gapi.auth2.getAuthInstance();
                session.attachSignin(document.getElementById('google-signin'));
                if (auth2.isSignedIn) {
                    session.onSignIn(auth2.currentUser.get().getAuthResponse());
                }
            });
        });
    };
    googleApi.src = "//apis.google.com/js/api:client.js";
    document.body.appendChild(googleApi);
})();

window.addEventListener("load", () => {

    Dropzone.autoDiscover = false;

    util.cookieInit();

    if (!!window.courses) {
        window.divCourses = document.querySelector('div.courses');
        courseData.createHtml();
    }

    $('a:not(.link)').click(() => {
        return false;
    });
    util.createToolTips();

    $('form#course-upload').dropzone({
        url: "/course-upload",
        paramName: "file",
        maxFilesize: 6, // MB
        acceptedFiles: ".rar,.zip,.7zip,.7z,.tar",
        previewTemplate: $('#preview-template').html(),
        init: function() {
            this.on("addedfile", function() {
                //$(this).find('.dz-message').remove();
            });
            this.on("error", function(file, errorMessage) {
                $('.dz-error-mark').show();
                $('.dz-error-message').html(errorMessage);
            });
            this.on("success", function(file, response) {
                let res = JSON.parse(response);
                if (!!res.err) {
                    $('.dz-error-mark').show();
                    $('.dz-error-message').html(res.err);
                } else {
                    $('.dz-success-mark').show();

                    courses[res.course.id] = res.course;
                    courseData.buildOwnCourseHtml(courses[res.course.id], true);
                    util.createToolTips();

                }
            });
        }
    });

    let courseUploads = [];
    let courseIndex = 0;
    $.fn.courseReupload = function() {
        this.each(function() {
            courseUploads.push(this);
            courseIndex++;
            $(this).dropzone({
                url: "/course-reupload",
                paramName: "file",
                maxFilesize: 6, // MB
                acceptedFiles: ".rar,.zip,.7zip,.7z,.tar",
                maxFiles: 1,
                headers: { "course-id": $(courseUploads[courseIndex-1]).parent().parent().attr('course-id') },
                previewTemplate: $('#preview-template').html(),
                init: function() {
                    this.on("addedfile", function() {
                        //$(this).find('.dz-message').remove();
                        //this.removeAllFiles();
                    });
                    this.on("error", function(file, errorMessage) {
                        $('.dz-error-mark').show();
                        $('.dz-error-message').html(errorMessage);
                    });
                    this.on("success", function() {
                        $('.dz-success-mark').show();
                    });
                }
            });
        });
    };
    $('.course-reupload').courseReupload();

    let imageUploads = [];
    let imageIndex = 0;
    $.fn.imageUpload = function() {
        this.each(function() {
            imageUploads.push(this);
            imageIndex++;
            $(this).dropzone({
                url: "/image-upload",
                paramName: "file",
                maxFilesize: 2, // MB
                acceptedFiles: 'image/png,image/jpeg',
                maxFiles: 1,
                headers: { "course-id": $(imageUploads[imageIndex-1]).parent().parent().attr('course-id') },
                previewTemplate: $('#preview-template').html(),
                init: function() {
                    this.on("addedfile", function() {
                        //$(this).find('.dz-message').remove();
                        //this.removeAllFiles();
                    });
                    this.on("error", function(file, errorMessage) {
                        $('.dz-error-mark').show();
                        $('.dz-error-message').html(errorMessage);
                    });
                    this.on("success", function() {
                        $('.dz-success-mark').show();
                    });
                }
            });
        });
    };
    $('.image-upload').imageUpload();

    $('.smm-button').hover(function() {
        $(this).find('.smm-icon').css('background-color', '#161632');
    }, function () {
        if ($(this).hasClass('signout')) {
            $(this).find('.smm-icon').css('background-color', '#ffe500');
        } else {
            $(this).find('.smm-icon').css('background-color', '#323245');
        }
    });

    $(window).keydown(function(event) {
        if(event.keyCode === 13) {
            event.preventDefault();
            return false;
        }
    });

    $('.course-type select').change(function() {
        if ($(this).val() !== "0") {
            $('div.recreation').show();
        } else {
            $('div.recreation').hide();
        }
    });

    /*$('a.collapse').on('click', function(event) {
        util.collapse(event);
    });*/
    $('a.star').on('click', function(event) {
        util.star(event);
    });
    $('a.completed').on('click', function(event) {
        util.completed(event);
    });
    $('div.show-delete').on('click', function(element) {
        util.showDeleteMessage(element);
    });

});