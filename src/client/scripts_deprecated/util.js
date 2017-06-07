export default function Util() {
}

Util.prototype = {

    cookieInit: () => {

        window.cookieconsent.initialise({
            "palette": {
                "popup": {
                    "background": "#000"
                },
                "button": {
                    "background": "#f1d600"
                }
            },
            "showLink": false,
            "theme": "classic",
            "position": "bottom-left",
            "content": {
                "dismiss": "Let'se go!"
            }
        });

    },

    createToolTips: () => { // TODO

        $('.icon:not(.interactive-tooltip):not(.tooltipstered)').tooltipster();
        $('.interactive-tooltip').tooltipster({
            interactive: true,
            init: function (instance, helper) {
                let content = $(helper.origin).parent().children('.tooltip_content').detach();
                instance.content(content);
            }
        });
        $('.help-icon:not(.interactive-tooltip)').tooltipster({
            position: function (instance, helper, position) {
                position.coord.left += 140;
                return position;
            }
        });

    },

    showDeleteMessage: (element) => {

        let courseId = $(element).parent().parent().attr("course-id");
        $(element).parent().parent().addClass(courseId);
        $('#light').attr("course-id", courseId);
        let top = $(window).height() / 2 - 50;
        $('#light').css("top", top + "px");
        let left = $(window).width() / 2 - 150;
        $('#light').css("left", left + "px");
        $('#light').show();
        $('#fade').show();
    },

    hideDeleteMessage: () => {

        $('#light').hide();
        $('#fade').hide();

    },

    filter: function (ispackage) {

        let request = {};

        request.order = $('select[filter="order"]').val();
        request.dir = $('select[filter="dir"]').val();

        if (!!$('input[filter="lastmodifiedfrom"]').val()) {
            request.lastmodifiedfrom = Math.trunc(Date.parse($('input[filter="lastmodifiedfrom"]').val()) / 1000);
        }
        if (!!$('input[filter="lastmodifiedto"]').val()) {
            request.lastmodifiedto = Math.trunc(Date.parse($('input[filter="lastmodifiedto"]').val()) / 1000);
        }
        if (!!$('input[filter="uploadedfrom"]').val()) {
            request.uploadedfrom = Math.trunc(Date.parse($('input[filter="uploadedfrom"]').val()) / 1000);
        }
        if (!!$('input[filter="uploadedto"]').val()) {
            request.uploadedto = Math.trunc(Date.parse($('input[filter="uploadedto"]').val()) / 1000);
        }
        if ($('select[filter="coursetype"]').val() !== "null") {
            request.coursetype = $('select[filter="coursetype"]').val();
        }
        if (!!$('input[filter="title"]').val()) {
            request.title = $('input[filter="title"]').val();
        }
        if (!!$('input[filter="owner"]').val()) {
            request.owner = $('input[filter="owner"]').val();
        }
        if ($('select[filter="leveltype"]').val() !== "null") {
            request.leveltype = $('select[filter="leveltype"]').val();
        }
        if ($('select[filter="difficultyfrom"]').val() !== "null") {
            request.difficultyfrom = $('select[filter="difficultyfrom"]').val();
        }
        if ($('select[filter="difficultyto"]').val() !== "null") {
            request.difficultyto = $('select[filter="difficultyto"]').val();
        }
        if ($('select[filter="updatereq"]').val() !== "null") {
            request.updatereq = $('select[filter="updatereq"]').val();
        }
        if ($('select[filter="hasthumbnail"]').val() !== "null") {
            request.hasthumbnail = $('select[filter="hasthumbnail"]').val();
        }
        let self = this;
        if (ispackage) {
            $.ajax({
                url: '/get-packages',
                type: 'post',
                data: JSON.stringify(request),
                success: (data) => {
                    window.courses = JSON.parse(data);
                    $('div.courses').html("");
                    courseData.createHtml();
                    self.createToolTips();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                },
                timeout: 3000
            });
        } else {
            $.ajax({
                url: '/get-courses',
                type: 'post',
                data: JSON.stringify(request),
                success: (data) => {
                    window.courses = JSON.parse(data);
                    $('div.courses').html("");
                    courseData.createHtml();
                    self.createToolTips();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                },
                timeout: 3000
            });
        }

    },

    apiKeyShow: function (element) {

        $(element).parent().children('div.api-key-show').find('.link').html(window.apiKey);
        this.copyTextToClipboard(window.apiKey);

    },

    copyTextToClipboard: function (text) {

        let textArea = document.createElement("textarea");
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = 0;
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';

        textArea.value = text;

        document.body.appendChild(textArea);

        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.log('Oops, unable to copy');
        }

        document.body.removeChild(textArea);

    }

};