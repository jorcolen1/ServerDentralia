 require('dotenv').config()
 const {initializeApp,applicationDefault}=require('firebase-admin/app')
 const {getFirestore}=require('firebase-admin/firestore')
 initializeApp({
    type: process.env.type,
    project_id: process.env.project_id,
  private_key_id:process.env.private_key_id,
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCWNM7mEqx0e9tI\n2GVIn9yAYy71ST2tV9g46GwbPPHLSOBMPySUiXFZkLabGAJJ0pL3Z760FBlJ81cz\nu0icImpwZsrMY29PAEwSSGlQ0fP8Bmg2IVc5XWIFptxdYMqa7WsM/y8b7vCiPgea\naSf7yd0xxPomILTsfT/zevUIb3tuu20mhyil/V/P8oLukysyAKNvVibBJvP29weJ\njSd/vWeKp93rn8vnXa/pMG9tAJVnuAizFGsuFBKHQ4EqfWkjR0s4pK8vQ0+6mUYa\nLqtKlG8qvtrsJ3IKi1lHI4yRi42/vdmwyhAAiDlhICT1lS7zCbHg0mcIhEfY2XIL\nPidc0BxtAgMBAAECggEAOXLKHRnQRp7mcDZ/imbF9X65w4u3ILjD1IQkcMh+7BKb\n4t2Vlo/4v9pG1Qu6OFTm6+QMfqBfSbbdx8XeEAVjs0jFUKXJOSxya92xFf2u9NnY\nereGvkR2jJXUm4w9AUND2c0xzdu1wj+6Nbb5WWZMCNB/Ih0JRZfj4TJKTGcjDObh\nKeW55Nf0Y8HIv/WLPvAKpa69Kukg+KgiWgYvq9nmzNHxmDMaB2LEr2zcCZk1V8xP\nK3BZrTX7c2NWScZXuz2C+jDd327VVrKFMMqvyDlB0j+EwfZ6UyuEsnS1bCaME0n+\nclsy6WfbiHBcdq8u+uoczvP3GtOm/SiOpT0U7JYhWwKBgQDPpeb6NrPNOeEU1D1n\ny8yS1rei12KJfmhA8NssrlezuaKxThjaEwhgvVKrX5h1UKIDiedVDO85PhpzwCXU\nxilSTqoU8FGXWzbFfQqjsv0Nc4NXsGePTumRVPxueDm/nzr5Lx+imzUO7v/w6cXn\nE0cp0gp2sGHPmssm/VpVVM3r5wKBgQC5Lr9Noq1G6LY8abgzljZ/9DZ0P+cXT9I1\nZ0XhfR3qxtsFHoifVQRdDeUik4uBLqq1wBeFHwnT90xc5hg4vWpNyf9sKnBka2Bm\nTSRE14VNxjt01oivbik4XlEtTDJ2quZjJUZ3tHrW+uxLpgH49eAu77MG0hVOhKTo\n7CNQgqYKiwKBgQCETnMz7vL1yvFNskZGAqcg0MtFaPOSJAcNieo9OAENtTSiwN44\n5XOrIDayl0CvT2dL1eyeVpV+5cE5C6+POYxOs2zP1qhGRopJn3jOAVgX4AhKMU5r\nE57jSUFmqhgxrqWG7K29kCNoloRh3rKIn9HyJbEhGxXXkAvtlfSe9mAW9QKBgETb\nhhTnJYlVZNXn9a9w7oj7lPf6/wHjE2X6Jbjn3iT7lls79E9SvJGhZg9KT7hUUvPM\nHrLITM49iW6NvHn0rL+KGejtiuc8KhdAHflfLlkyGc+jKiYZT0h/ga3XRHhtqcc6\nCA7g1EB2A0FJ1DfvrVGmnaoume+dUPivPZ5lRjprAoGAZhmOqK5hYYO92fSLLb00\nHoSx//gqHLa2+OJHesPiXHnPril7aqIe6bEJWAvYBuGmIPJWNNE+50/F1zvFXf+k\nlaWJBQNFyqCVzHro3UTApQ6+IJkq7kxKAAmWraW1SAXDyWac61UYqHLuTdlCb39U\nTSdjwwAuHpJPojVmIxmqdEg=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-38c83@serverdatabase010.iam.gserviceaccount.com",
  client_id: "102470604864785971949",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-38c83%40serverdatabase010.iam.gserviceaccount.com"
});

const db = getFirestore()

module.exports ={
    db,
}
