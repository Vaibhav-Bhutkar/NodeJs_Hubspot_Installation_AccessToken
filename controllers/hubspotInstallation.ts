import axios from "axios";
import { Request, response, Response } from "express";

const request = require('request-promise-native');
const CLIENT_ID: any = "HUBSPOT_CLIENT_ID"; //Put husbpot client ID once app created.
const CLIENT_SECRET: string | undefined = "HUBSPOT_CLIENT_SECRET"; //Use hubspot secret 
const HUBSPOT_AUTHURI: string | undefined = "HUBSPOT_APP_INSTALL_URI"; //Hubspot API URL
const REDIRECT_URI = `http://localhost:5000/vb/api/appResponse`; // TO use when running on local

let SCOPES = 'HUBSPOT_SCOPE'; //Define hubspot scope - copy it from hubspot app.
SCOPES = (SCOPES.split(/ |, ?|%20/)).join(' ')

const NodeCache = require("node-cache");

const accessTokenCache = new NodeCache({ deleteOnExpire: true });
const refreshTokenStore = {};
let userID = "";
let CompanyID = "";

//Authorization url provided by Hubspot.
const authUrl =
    'https://app.hubspot.com/oauth/authorize' +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
    `&scope=${encodeURIComponent(SCOPES)}` + // scopes being requested by the app
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page

//Code to start app installtion from here 
//Initially user get redirected with details fro handshake.
//Then received authorization code from Hubspot.
const installHubspotApplication = (req: Request, res: Response) => {
    var sessionID = req.sessionID;
    CompanyID = req.params.CompanyID;
    res.redirect(authUrl);
    //console.log("request code " + req.query.code);
    console.log("Client ID " + CLIENT_ID)
};


//Here we will get Authorization code from Hubspot if above shared details are correct. 
const getHubspotResponse = async (req: Request, res: Response) => {
    try {
        var code = req.query?.code;
        console.log("Code  is ", code);
        if (code) {
            console.log('       > Received an authorization token');
            console.log('       > Received an authorization token==' + code);
            const authCodeProof = {
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: code
            };
            const token = await exchangeForTokens(req.sessionID, authCodeProof);
            if (token.message) {
                // return res.redirect(`/error?msg=${token.message}`);
            } else (
                res.redirect(`${process.env.API_URL}`)
            )
        }
    } catch (error: any) {
        console.error(`       > Error getting Authorization code.`);
    }
};


//Post call to get access token based on Authorization code received. 
const exchangeForTokens = async (userId: any, exchangeProof: any) => {
    try {
        const responseBody = await request.post(`${HUBSPOT_AUTHURI}/v1/token`, {
            form: exchangeProof
        });
        // Usually, this token data should be persisted in a database and associated with
        // a user identity.
        const tokens = JSON.parse(responseBody);
        //refreshTokenStore[userId] = tokens.refresh_token;
        accessTokenCache.set(userId, tokens.access_token, Math.round(tokens.expires_in * 0.75));
        accessTokenCache.set(userId, tokens.access_token, 5);
        userID = userId;
        console.log('       > Received an access token and refresh token');
        //Code to store token value in Database
        if (tokens) {
            console.log("Received token is ", tokens);
        }
        return tokens.access_token;
    } catch (error: any) {
        console.error(`       > Error exchanging ${exchangeProof.grant_type} for access token`);

    }
};



export default { installHubspotApplication, getHubspotResponse, };