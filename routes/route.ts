import { Router } from "express";
import hubspot from '../controllers/hubspotInstallation';
import axios from 'axios';
const router = Router();
// ---- Hubspot Installation route
router.get('/hubspot', hubspot.installHubspotApplication);







module.exports = router;