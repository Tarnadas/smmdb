import Account from '../Account'
import { courses } from '../Course'

export function log (message) {
    console.log(`${new Date().toISOString().substr(0, 19)} ${message}`);
}

export function calculatePoints () {

    for (let courseId in courses) {
        if (courses.hasOwnProperty(courseId)) {
            let course = courses[courseId];
            Account.getAccount(course.owner).points += course.getPoints();
        }
    }

}

export function generateAPIKey ()  {

    let key = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 30; i++)
        key += possible.charAt(Math.floor(Math.random() * possible.length));

    return key;

}