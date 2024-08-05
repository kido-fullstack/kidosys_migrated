const login = require('./login.validator');
const OTP = require('./otp.validator');
const resendOTP = require('./resendotp.validator');
const bookmark = require('./bookmark.validator');
const addLead = require('./addLead.validator');
const addLeadFromWebsite = require('./addLeadFromWebsite.validator');
const getOverdueFollowups = require('./getOverdueFollowups.validator');
const editLead = require('./editLead.validator');
const addFollowups = require('./addFollowups.validator');
const addMessage = require('./addMessage.validator');
const sendMessage = require('./sendMessage.validator');
const transferLead = require('./transferLead.validator');
const centerId = require('./centerId.validator');

module.exports = {
    login,
    bookmark,
    addLead,
    addLeadFromWebsite,
    editLead,
    addFollowups,
    addMessage,
    OTP,
    resendOTP,
    getOverdueFollowups,
    sendMessage,
    transferLead,
    centerId
}
