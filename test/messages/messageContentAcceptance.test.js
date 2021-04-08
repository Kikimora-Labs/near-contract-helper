'use strict';
const path = require('path');

const recoveryMessageContentHelpers = require('../../accountRecoveryMessageContent');
const messageContent2faHelpers = require('../../middleware/2faMessageContent');
const { getSecurityCodeEmail, getNewAccountEmail, get2faHtml } = require('../../utils/email');
const messageContentFixtures = require('./fixtures');
const validateAcceptanceTestContent = require('./validateAcceptanceTest');

const {
    getVerify2faMethodMessageContent,
    getAddingFullAccessKeyMessageContent,
    getConfirmTransactionMessageContent
} = messageContent2faHelpers;

const { getNewAccountMessageContent, getSecurityCodeMessageContent } = recoveryMessageContentHelpers;

const {
    actionsByType,
    allActions
} = messageContentFixtures;

function inTestOutputDir(testname, filename) {
    return {
        directory: path.join(__dirname, 'acceptanceTestOutputs', testname),
        filename
    };
}

function getMessageContentAcceptanceOutput(messageContent) {
    return `Text content for SMS and rich text incapable email clients:
-----------------------------------
${messageContent.text}
-----------------------------------

Subject (included in email only):
-----------------------------------                
${messageContent.subject}
-----------------------------------

Request Details (included in email only):
-----------------------------------
${(messageContent.requestDetails || []).join('\n')}
-----------------------------------
`;
}

describe('message content acceptance tests', function () {
    describe('get security code', function () {
        const accountId = 'exampleaccount3456';
        const securityCode = '123456';

        it('security code html should match our acceptance html', function () {
            // Acceptance test: run with this set to `true` to regenerate acceptance.
            const forceUpdateAcceptanceTestContent = false;
            const messageContent = getSecurityCodeEmail(accountId, securityCode);

            validateAcceptanceTestContent({
                forceUpdateAcceptanceTestContent: forceUpdateAcceptanceTestContent,
                output: inTestOutputDir('getSecurityCode', 'getSecurityCode.html'),
                newMessageContent: messageContent
            });
        });

        it('security code message content should match our acceptance message', function () {
            // Acceptance test: run with this set to `true` to regenerate acceptance.
            const forceUpdateAcceptanceTestContent = false;
            const messageContent = getSecurityCodeMessageContent({ accountId, securityCode });

            validateAcceptanceTestContent({
                forceUpdateAcceptanceTestContent: forceUpdateAcceptanceTestContent,
                output: inTestOutputDir('getSecurityCode', 'getSecurityCode.txt'),
                newMessageContent: getMessageContentAcceptanceOutput(messageContent)
            });
        });
    });

    describe('create new account', function () {
        it('new account html should match our acceptance html', function () {
            // Acceptance test: run with this set to `true` to regenerate sample.
            const forceUpdateAcceptanceTestContent = false;
            const messageContent = getNewAccountEmail('exampleaccount3456', 'http://example.recovery.url.com', '123456');

            validateAcceptanceTestContent({
                forceUpdateAcceptanceTestContent: forceUpdateAcceptanceTestContent,
                output: inTestOutputDir('createNewAccount', 'createNewAccount.html'),
                newMessageContent: messageContent
            });
        });

        it('new account message content should match our acceptance message', function () {
            // Acceptance test: run with this set to `true` to regenerate sample.
            const forceUpdateAcceptanceTestContent = false;
            const messageContent = getNewAccountMessageContent({
                accountId: 'exampleaccount3456',
                securityCode: '123456',
                recoverUrl: 'http://www.example.recover.url/'
            });

            validateAcceptanceTestContent({
                forceUpdateAcceptanceTestContent: forceUpdateAcceptanceTestContent,
                output: inTestOutputDir('createNewAccount', 'createNewAccount.txt'),
                newMessageContent: getMessageContentAcceptanceOutput(messageContent)
            });
        });
    });

    describe('2fa message contents', function () {
        describe('adding new FULL ACCESS KEY', function () {
            it('adding new FULL ACCESS KEY should match our acceptance html', function () {
                // Acceptance test: run with this set to `true` to regenerate sample.
                const forceUpdateAcceptanceTestContent = false;

                const { requestDetails } = getAddingFullAccessKeyMessageContent({
                    accountId: 'exampleaccount3456',
                    securityCode: '123456',
                    publicKey: actionsByType.AddKey.addFullAccessKey.public_key,
                    request: {
                        receiver_id: 'exampleaccount3456',
                        actions: [actionsByType.AddKey.addFullAccessKey]
                    }
                });

                const htmlContent = get2faHtml('123456', requestDetails, {
                    accountId: 'exampleaccount3456',
                    public_key: 'fakKey'
                });

                validateAcceptanceTestContent({
                    forceUpdateAcceptanceTestContent: forceUpdateAcceptanceTestContent,
                    output: inTestOutputDir('addFullAccessKey2fa', '2faAddingFullAccessKey.html'),
                    newMessageContent: htmlContent
                });
            });

            it('adding new FULL ACCESS KEY should match our acceptance message', function () {
                // Acceptance test: run with this set to `true` to regenerate sample.
                const forceUpdateAcceptanceTestContent = false;
                const messageContent = getAddingFullAccessKeyMessageContent({
                    accountId: 'exampleaccount3456',
                    securityCode: '123456',
                    publicKey: actionsByType.AddKey.addFullAccessKey.public_key,
                    request: {
                        receiver_id: 'exampleaccount3456',
                        actions: [actionsByType.AddKey.addFullAccessKey]
                    },
                    isForSms: true
                });

                validateAcceptanceTestContent({
                    forceUpdateAcceptanceTestContent: forceUpdateAcceptanceTestContent,
                    output: inTestOutputDir('addFullAccessKey2fa', '2faAddingFullAccessKey.txt'),
                    newMessageContent: getMessageContentAcceptanceOutput(messageContent)
                });
            });
        });

        describe('confirm transactions with 2fa', function () {
            it('confirm transactions with 2fa should match our acceptance html', function () {
                // Acceptance test: run with this set to `true` to regenerate sample.
                const forceUpdateAcceptanceTestContent = false;
                const { requestDetails } = getConfirmTransactionMessageContent({
                    accountId: 'exampleaccount3456',
                    securityCode: '123456',
                    request: {
                        receiver_id: 'testreceiveraccount',
                        actions: allActions.filter(({ type, permission }) => !(type === 'AddKey' && !permission))
                    }
                });


                const htmlContent = get2faHtml('123456', requestDetails);

                validateAcceptanceTestContent({
                    forceUpdateAcceptanceTestContent: forceUpdateAcceptanceTestContent,
                    output: inTestOutputDir('confirmTransactions2fa', 'confirmTransactions2fa.html'),
                    newMessageContent: htmlContent
                });
            });

            it('confirm transactions with 2fa should match our acceptance message', function () {
                // Acceptance test: run with this set to `true` to regenerate sample.
                const forceUpdateAcceptanceTestContent = false;
                const messageContent = getConfirmTransactionMessageContent({
                    accountId: 'exampleaccount3456',
                    securityCode: '123456',
                    request: {
                        receiver_id: 'testreceiveraccount',
                        actions: allActions.filter(({ type, permission }) => !(type === 'AddKey' && !permission))
                    },
                    isForSms: true
                });

                validateAcceptanceTestContent({
                    forceUpdateAcceptanceTestContent: forceUpdateAcceptanceTestContent,
                    output: inTestOutputDir('confirmTransactions2fa', 'confirmTransactions2fa.txt'),
                    newMessageContent: getMessageContentAcceptanceOutput(messageContent)
                });
            });
        });

        describe('verify add new 2FA Method', function () {
            it('verify add new 2FA Method should match our acceptance html', function () {
                // Acceptance test: run with this set to `true` to regenerate sample.
                const forceUpdateAcceptanceTestContent = false;
                const { requestDetails } = getVerify2faMethodMessageContent({
                    accountId: 'exampleaccount3456',
                    securityCode: '123456',
                    destination: '+1 555-555-5555',
                });


                const htmlContent = get2faHtml('123456', requestDetails);

                validateAcceptanceTestContent({
                    forceUpdateAcceptanceTestContent: forceUpdateAcceptanceTestContent,
                    output: inTestOutputDir('verify2faMethod', 'verify2faMethod.html'),
                    newMessageContent: htmlContent
                });
            });

            it('verify add new 2FA Method should match our sample message', function () {
                // Acceptance test: run with this set to `true` to regenerate sample.
                const forceUpdateAcceptanceTestContent = false;
                const messageContent = getVerify2faMethodMessageContent({
                    accountId: 'exampleaccount3456',
                    destination: '+1 555-555-5555',
                    securityCode: '123456'
                });

                validateAcceptanceTestContent({
                    forceUpdateAcceptanceTestContent: forceUpdateAcceptanceTestContent,
                    output: inTestOutputDir('verify2faMethod', 'verify2faMethod.txt'),
                    newMessageContent: getMessageContentAcceptanceOutput(messageContent)
                });
            });
        });
    });
});