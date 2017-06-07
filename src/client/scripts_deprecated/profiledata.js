export default function ProfileData() {
    
}

ProfileData.prototype = {

    updateProfile: function(element) {
        $.ajax({
            url: '/profile-update',
            type: 'post',
            data: $(element).parent().children('form.profile-update').serialize(),
            success: (data) => {
                alert("Saved");
            },
            error: (jqXHR, textStatus) => {
                if (textStatus == "timeout") {
                    console.log("Server timed out");
                } else {
                    console.log(jqXHR.responseText);
                }
            },
            timeout: 3000
        });
    }

};