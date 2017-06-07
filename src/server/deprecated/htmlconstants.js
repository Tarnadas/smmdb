export const courseTabButton =
    `<div class='smm-button tab-button'>
        <a href='/' class='link'><div class='link'>Courses</div></a>
    </div>`;

    this.packageTabButton =
        "<div class='smm-button tab-button'>" +
        "<a href='/package' class='link'><div class='link'>Packages</div></a>" +
        "</div>";
    this.profileSubmitButton =
        "<div class='submit-profile smm-button' onclick='profileData.updateProfile(this)'>" +
        "<div class='smm-icon'><img src='/img/submit.png' /></div>" +
        "<div class='link'>Save</div>" +
        "</div>";
    this.apiKeyShowButton =
        "<div class='api-key-show smm-button' onclick='util.apiKeyShow(this)'>" +
        "<div class='smm-icon'><img src='/img/api.png' /></div>" +
        "<div class='link'>Show API Key and copy to clipboard</div>" +
        "</div>";
    this.filterCoursesButton =
        "<div class='smm-button' onclick='util.filter(false)'>" +
        "<div class='smm-icon'><img src='/img/submit.png' /></div>" +
        "<div class='link'>Search</div>" +
        "</div>";
    this.filterPackagesButton =
        "<div class='smm-button' onclick='util.filter(true)'>" +
        "<div class='smm-icon'><img src='/img/submit.png' /></div>" +
        "<div class='link'>Search</div>" +
        "</div>";
    this.sidebarCourses =
        "<div class='orderby'>" +
        "Order By:</br>" +
        "<div>" +
        "<select filter='order'>" +
        "<option value='lastmodified'>Last Modified</option>" +
        "<option value='uploaded'>Upload Date</option>" +
        "<option value='title'>Title</option>" +
        "<option value='stars'>Stars</option>" +
        "<option value='downloads'>Downloads</option>" +
        "<option value='completed'>Completions</option>" +
        "</select>" +
        "</div>" +
        "<div>" +
        "<select filter='dir'>" +
        "<option value='desc'>Descending</option>" +
        "<option value='asc'>Ascending</option>" +
        "</select>" +
        "</div>" +
        "</div>" +
        "<div class='filterby'>" +
        "Filter By:</br>" +
        "<div class='filter'>" +
        "Last Modified</br>" +
        "<table>" +
        "<tr>" +
        "<td>From</td>" +
        "<td><input filter='lastmodifiedfrom' type='date' /></td>" +
        "</tr>" +
        "<tr>" +
        "<td>To</td>" +
        "<td><input filter='lastmodifiedto' type='date' /></td>" +
        "</tr>" +
        "</table>" +
        "</div>" +
        "<div class='filter'>" +
        "Upload Date</br>" +
        "<table>" +
        "<tr>" +
        "<td>From</td>" +
        "<td><input filter='uploadedfrom' type='date' /></td>" +
        "</tr>" +
        "<tr>" +
        "<td>To</td>" +
        "<td><input filter='uploadedto' type='date' /></td>" +
        "</tr>" +
        "</table>" +
        "</div>" +
        "<div class='filter'>" +
        "Course Type</br>" +
        "<select filter='coursetype'>" +
        "<option value='null' selected></option>" +
        "<option value='0'>Own Creation</option>" +
        "<option value='1'>Recreation</option>" +
        "<option value='2'>Wii U Dump</option>" +
        "</select>" +
        "</div>" +
        "<div class='filter'>" +
        "Title</br>" +
        "<input filter='title' />" +
        "</div>" +
        "<div class='filter'>" +
        "Owner</br>" +
        "<input filter='owner' />" +
        "</div>" +
        "<div class='filter'>" +
        "Level Type</br>" +
        "<select filter='leveltype'>" +
        "<option value='null' selected></option>" +
        "<option value='0'>Super Mario Bros U</option>" +
        "<option value='1'>Super Mario World</option>" +
        "<option value='2'>Super Mario Bros 3</option>" +
        "<option value='3'>Super Mario Bros</option>" +
        "<option value='4'>Mixed</option>" +
        "</select>" +
        "</div>" +
        "<div class='filter'>" +
        "Difficulty</br>" +
        "<table>" +
        "<tr>" +
        "<td>From</td>" +
        "<td><select filter='difficultyfrom'>" +
        "<option value='0' selected>Easy</option>" +
        "<option value='1'>Normal</option>" +
        "<option value='2'>Expert</option>" +
        "<option value='3'>Super Expert</option>" +
        "<option value='4'>Mixed</option>" +
        "</select></td>" +
        "</tr>" +
        "<tr>" +
        "<td>To</td>" +
        "<td><select filter='difficultyto'>" +
        "<option value='0'>Easy</option>" +
        "<option value='1'>Normal</option>" +
        "<option value='2'>Expert</option>" +
        "<option value='3' selected>Super Expert</option>" +
        "<option value='4'>Mixed</option>" +
        "</select></td>" +
        "</tr>" +
        "</table>" +
        "</div>" +
        "<div class='filter'>" +
        "Update Required</br>" +
        "<select filter='updatereq'>" +
        "<option value='null' selected></option>" +
        "<option value='1'>Yes</option>" +
        "<option value='0'>No</option>" +
        "</select>" +
        "</div>" +
        "<div class='filter'>" +
        "Has Thumbnail</br>" +
        "<select filter='hasthumbnail'>" +
        "<option value='null' selected></option>" +
        "<option value='1'>Yes</option>" +
        "<option value='0'>No</option>" +
        "</select>" +
        "</div>" +
        "</div>";