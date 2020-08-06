const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 8000;
const DB_URL = isProduction ? 'mongodb://cmpt470.dpsi.jp:27017' : 'mongodb://localhost:27017';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;    // 10 MB
const GEC_CREDENTIALS = {
    "type": "service_account",
    "project_id": "darienimai301276974",
    "private_key_id": "e1cb9cc5f141250ce9829ecc831b9a9aac606400",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCS5Au+zw7D+f0t\nkr4i0OgcPifnLWiJOc9nye3FCLx6+nvddyQJ7x78DEToGnqEUiEnCMKwaQqEF00/\nTiS2ZMP6UH3iOZdzceR7g+oB0RW7abbuIP22UnIIHRxqxm5kmqeXDKfMg4JwxE+4\nkTK2MawS/4kWvn8Se5gPdF3cyT2L1uPaxOdGFKts5oFXyNV4F4/3o3pGNXChoYSd\n+9anxAGjUACEw5WYwmNEtPknVSpUtBVztofv9XL7zXatOEzP1NLaQM60OSwjt0yf\nu7UibijUtSo84g4nnLGdCAvge8E6xLWGSLkhdIhma9DZ0Qk/3klRb5KlLJ8Lr9c6\nonTZ1axbAgMBAAECggEAQSZzTSySLHr2/50bxt5obIpm8WKTAHZLFwoZcvBGhLcP\ndDFRIzTTRdB9SYLg/0pcGO+KRms4dlDNerwCjYFQ6PeFde68TUBhKiVeh3LAlFC1\niZXJYfHcUNv0jCk5slZj6Zt72zojAzgW8dI4r1WFsCF1oMhaHQ0DayteLDx3l0tK\n2sV3jRIS9q9BcdQ/Rn39W4y22TNMm+0XZ+rhTkdjb6AK7ykWIxXyuY9Hki7/fuI7\nSv6Yc3KCfVTRzVeHWtIpm1qN6OrBLdeqW/J4Vh1DAmTLLBc2e0m0avvbY9OYDsQS\nnIOrScBKeOM7/WpSe/N8Az1s4oze1KfhR2HBx2nivQKBgQDDv0tIQrwIKs3Ae3+I\n9OW+fROQJx7R9TNPNqkLHT6gFO83OohINuTSz3lVJSOCG2Chz3W9CIczZVJYeyL+\n0efBcEtAhPqBh+7X7/PVvhPqz0PJsq0jw898QU0aaEBzQ9udr42lkOWowSx826HN\ni3wMH7Zjs7E+MIC9mg/wCaLChwKBgQDAGuiZzsjRVIcqqwfvqEHDy+4iNutF5EiF\nKRcLvAvEOwuskFld9up2xIFp5TRwRyfPoTBwNVEEqle0F0EA8cWpTiCcZkG+YSxZ\nMb+Zq4ItSnPZ8BILFO2XHGVkbmzT6+jJNDYMD859WRhXF3inheHyT1wZpMCaZIUU\nckTNvAU4jQKBgFTRFaCo8eqkCWUm3fsNCmOAtLJYkR0unt3q9FJRiKo6h/CpVxXb\nW0kRByTio8EjdbqHNyACivq1I3odWOuLLl19981sEVOA//fnDAOIif7Lcjb6SdVe\nahAQB4WyuIJ5W7a2s6yS3UBC+7DaRgDXOJfUQeZvnRQyVgZRtCgxNKoPAoGAUf+q\nZWy0n1WbVIUooA2L9M1pWkVi67RjmCNP6PxdcWdatk/vNYKd1hBOxSrG1V4qCiBd\nkqfPa1Ril0aNwp9wpbHpjZjAW0kTKwdnJ2rj5/0tsksdCInoWGYQiWvxHAxIkwms\nQD3HAA41q4cjQy6MoWdqgq+mXsClZXLZF5A4EkkCgYBuqNEEZjhlCO+ylzdRMeJp\ndjtML/O9S+T8fcMKa8hVbfXCaqXsK5za8Pqeg4vQ6gwnoyhVyLig9cSuIUxClRBS\npz9NYY8GKR5bcsebCoImKX/vHTh4TT3rhf70WgOXJNAVfaLtt2poy34c45Hh2LCv\nxJGSFLG+HwD59ezPPU6V8Q==\n-----END PRIVATE KEY-----\n",
    "client_email": "vision470@darienimai301276974.iam.gserviceaccount.com",
    "client_id": "100672624735412335762",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/vision470%40darienimai301276974.iam.gserviceaccount.com"
};

export { isProduction, port, DB_URL, MAX_IMAGE_SIZE, GEC_CREDENTIALS };