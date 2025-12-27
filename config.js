/**
 * Apex Music - 
 * 
 * @fileoverview 
 * @module ConfigurationManager
 * @version 1.0.0
 * @author Lerox
 */
require("dotenv").config();
const EnvironmentVariableProcessor = require('process').env;

class EnterpriseConfigurationManager {
    constructor() {
        this.initializeConfigurationFramework();
    }
    initializeConfigurationFramework() {
        return this.constructPrimaryConfigurationSchema();
    }
    constructPrimaryConfigurationSchema() {
        return {
            discord: {
                token: process.env.TOKEN || EnvironmentVariableProcessor.TOKEN || ""
            },
            mongodb: {
                uri: process.env.MONGODB_URI || EnvironmentVariableProcessor.MONGODB_URI || ""  
            },
            
            lavalink: {
                host: EnvironmentVariableProcessor.LAVALINK_HOST || "de-01.strixnodes.com", 
                port: EnvironmentVariableProcessor.LAVALINK_PORT || 2010,       
                password: EnvironmentVariableProcessor.LAVALINK_PASSWORD || "glace", 
                secure: EnvironmentVariableProcessor.LAVALINK_SECURE === 'true' || false
            },
            
            bot: {
                prefix: EnvironmentVariableProcessor.BOT_PREFIX || ".",
                ownerIds: ["983793704701681674","991409937022468169","813466929594630164"],
                embedColor: 0x00AE86,
                supportServer: "https://discord.gg/4EMVfFTasz",
                defaultStatus: "Powered By Lerox 💘"
            },
            
            features: this.constructAdvancedFeatureConfiguration()
        };
    }
    
    constructAdvancedFeatureConfiguration() {
        return {
            autoplay: true,           // 👈 Auto-play related songs when queue ends
            centralSystem: true,      // 👈 Enable central music control system
            autoVcCreation: true,     // 👈 🔥 PREMIUM: Auto voice channel creation
            updateStatus: true,       // 👈 Update bot status with current song  
            autoDeaf: true,           // 👈 Auto-deafen bot in voice channels
            autoMute: false,          // 👈 Auto-mute bot in voice channels
            resetOnEnd: true          // 👈 Reset player when queue ends
        };
    }
}

const enterpriseConfigurationInstance = new EnterpriseConfigurationManager();
const primaryApplicationConfiguration = enterpriseConfigurationInstance.initializeConfigurationFramework();

/**
 * Export configuration for application-wide utilization
 * 
 * @type {Object} Comprehensive application configuration object
 */
module.exports = primaryApplicationConfiguration;
