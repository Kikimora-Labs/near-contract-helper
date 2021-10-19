const models = require('../../models');
const constants = require('../../constants');

const { IDENTITY_VERIFICATION_METHOD_KINDS } = constants;
const { IdentityVerificationMethod } = models;

const SequelizeIdentityVerificationMethods = {
    async claimIdentityVerificationMethod({ identityKey, kind }) {
        const [verificationMethod] = await IdentityVerificationMethod.update(
            {
                claimed: true,
                securityCode: null,
            },
            {
                where: {
                    identityKey,
                    kind,
                },
            });

        return verificationMethod.toJSON();
    },

    async getIdentityVerificationMethod({ identityKey, kind }) {
        const verificationMethod = await IdentityVerificationMethod.findOne({
            where: {
                identityKey,
                kind,
            },
        });

        return verificationMethod.toJSON();
    },

    async recoverIdentity({ identityKey, kind, securityCode }) {
        try {
            const [verificationMethod, verificationMethodCreated] = await IdentityVerificationMethod.findOrCreate({
                where: {
                    identityKey: identityKey.toLowerCase(),
                    kind,
                },
                defaults: {
                    securityCode,
                    uniqueIdentityKey: kind === IDENTITY_VERIFICATION_METHOD_KINDS.EMAIL ? this.getUniqueEmail(identityKey) : null,
                }
            });

            if (verificationMethod.claimed) {
                return false;
            }

            if (!verificationMethodCreated) {
                await verificationMethod.update({ securityCode });
            }

            return true;
        } catch (e) {
            // UniqueConstraintError thrown due to one of the following:
            // - provided `identityKey` already exists with a different value for `kind`
            // - provided `identityKey` doesn't exist but a row with the same `uniqueIdentityKey` does
            if (e.original && e.original.code === '23505') {
                return false;
            }

            throw e;
        }
    },
};

module.exports = SequelizeIdentityVerificationMethods;
