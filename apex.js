/**
 * Apex Music Bot 
 * Comprehensive Discord Bot
 * 
 * @fileoverview Core application
 * @version 1.0.0
 * @author Lerox
 */

const DiscordClientFramework = require('discord.js').Client;
const DiscordGatewayIntentBitsRegistry = require('discord.js').GatewayIntentBits;
const DiscordCollectionFramework = require('discord.js').Collection;
const RiffyAudioProcessingFramework = require('riffy').Riffy;
const FileSystemOperationalInterface = require('fs');
const SystemPathResolutionUtility = require('path');
const SystemConfigurationManager = require('./config');
const DatabaseConnectionEstablishmentService = require('./database/connection');
const AudioPlayerManagementHandler = require('./utils/player');
const ApplicationStatusManagementService = require('./utils/statusManager');
const MemoryGarbageCollectionOptimizer = require('./utils/garbageCollector');
const EnvironmentVariableConfigurationLoader = require('dotenv');
const shiva = require('./shiva');

EnvironmentVariableConfigurationLoader.config();

class DiscordClientRuntimeManager {
    constructor() {
        this.initializeClientConfiguration();
        this.initializeRuntimeSubsystems();
        this.initializeAudioProcessingInfrastructure();
        this.initializeApplicationBootstrapProcedures();
    }
    
    initializeClientConfiguration() {
        this.clientRuntimeInstance = new DiscordClientFramework({
            intents: [
                DiscordGatewayIntentBitsRegistry.Guilds,
                DiscordGatewayIntentBitsRegistry.GuildMessages,
                DiscordGatewayIntentBitsRegistry.GuildVoiceStates,
                DiscordGatewayIntentBitsRegistry.GuildMessageReactions,
                DiscordGatewayIntentBitsRegistry.MessageContent,
                DiscordGatewayIntentBitsRegistry.DirectMessages,
                DiscordGatewayIntentBitsRegistry.GuildPresences
            ]
        });
        
        this.clientRuntimeInstance.commands = new DiscordCollectionFramework();
        this.clientRuntimeInstance.slashCommands = new DiscordCollectionFramework();
        this.clientRuntimeInstance.mentionCommands = new DiscordCollectionFramework();
    }

    initializeRuntimeSubsystems() {
        this.statusManagementSubsystem = new ApplicationStatusManagementService(this.clientRuntimeInstance);
        this.clientRuntimeInstance.statusManager = this.statusManagementSubsystem;
        
        this.audioPlayerManagementSubsystem = new AudioPlayerManagementHandler(this.clientRuntimeInstance);
        this.clientRuntimeInstance.playerHandler = this.audioPlayerManagementSubsystem;
    }

    initializeAudioProcessingInfrastructure() {
        const audioNodeConfigurationRegistry = this.constructAudioNodeConfiguration();
        
        this.audioProcessingRuntimeInstance = new RiffyAudioProcessingFramework(
            this.clientRuntimeInstance, 
            audioNodeConfigurationRegistry, 
            {
                send: (audioPayloadTransmissionData) => {
                    const guildContextResolution = this.clientRuntimeInstance.guilds.cache
                        .get(audioPayloadTransmissionData.d.guild_id);
                    if (guildContextResolution) {
                        guildContextResolution.shard.send(audioPayloadTransmissionData);
                    }
                },
                defaultSearchPlatform: "ytmsearch",
                restVersion: "v4"
            }
        );
        
        this.clientRuntimeInstance.riffy = this.audioProcessingRuntimeInstance;
    }

    constructAudioNodeConfiguration() {
        const systemConfiguration = SystemConfigurationManager;
        
        return [
            {
                host: systemConfiguration.lavalink.host,
                password: systemConfiguration.lavalink.password,
                port: systemConfiguration.lavalink.port,
                secure: systemConfiguration.lavalink.secure
            }
        ];
    }
    
    initializeApplicationBootstrapProcedures() {
        this.applicationBootstrapOrchestrator = new ApplicationBootstrapOrchestrator(
            this.clientRuntimeInstance
        );
    }

    async executeApplicationBootstrap() {
        try {
            await this.applicationBootstrapOrchestrator.executeDatabaseConnectionEstablishment();
            await this.applicationBootstrapOrchestrator.executeCommandDiscoveryAndRegistration();
            await this.applicationBootstrapOrchestrator.executeEventHandlerRegistration();
            await this.applicationBootstrapOrchestrator.executeMemoryOptimizationInitialization();
            await this.applicationBootstrapOrchestrator.executeAudioSubsystemInitialization();
            await this.applicationBootstrapOrchestrator.executeClientAuthenticationProcedure();
            
        } catch (applicationBootstrapException) {
            this.handleApplicationBootstrapFailure(applicationBootstrapException);
        }
    }
    
    handleApplicationBootstrapFailure(exceptionInstance) {
        console.error('❌ Failed to initialize bot:', exceptionInstance);
        process.exit(1);
    }
}

class ApplicationBootstrapOrchestrator {
    constructor(clientRuntimeInstance) {
        this.clientRuntimeInstance = clientRuntimeInstance;
        this.commandDiscoveryEngine = new CommandDiscoveryEngine();
        this.eventHandlerRegistrationService = new EventHandlerRegistrationService();
        this.audioSubsystemIntegrationManager = new AudioSubsystemIntegrationManager(clientRuntimeInstance);
    }

    async executeDatabaseConnectionEstablishment() {
        await DatabaseConnectionEstablishmentService();
        console.log('✅ MongoDB connected successfully');
    }

    async executeCommandDiscoveryAndRegistration() {
        const commandRegistrationResults = await this.commandDiscoveryEngine
            .executeMessageCommandDiscovery(this.clientRuntimeInstance)
            .executeSlashCommandDiscovery(this.clientRuntimeInstance);
        
        console.log(`✅ Loaded ${commandRegistrationResults.totalCommands} commands`);
    }

    async executeEventHandlerRegistration() {
        const eventRegistrationResults = await this.eventHandlerRegistrationService
            .executeEventDiscovery()
            .bindEventHandlers(this.clientRuntimeInstance);
        
        console.log(`✅ Loaded ${eventRegistrationResults.totalEvents} events`);
    }

    async executeMemoryOptimizationInitialization() {
        MemoryGarbageCollectionOptimizer.init();
    }
 
    async executeAudioSubsystemInitialization() {
        this.clientRuntimeInstance.playerHandler.initializeEvents();
    }

    async executeClientAuthenticationProcedure() {
        const authenticationCredential = SystemConfigurationManager.discord.token || 
                                       process.env.TOKEN;
        
        await this.clientRuntimeInstance.login(authenticationCredential);
    }
}

class CommandDiscoveryEngine {
    constructor() {
        this.discoveredMessageCommands = 0;
        this.discoveredSlashCommands = 0;
    }
  
    executeMessageCommandDiscovery(clientInstance) {
        const messageCommandDirectoryPath = SystemPathResolutionUtility.join(__dirname, 'commands', 'message');
        
        if (FileSystemOperationalInterface.existsSync(messageCommandDirectoryPath)) {
            const discoveredCommandFiles = FileSystemOperationalInterface
                .readdirSync(messageCommandDirectoryPath)
                .filter(fileEntity => fileEntity.endsWith('.js'));
            
            for (const commandFile of discoveredCommandFiles) {
                const commandModuleInstance = require(SystemPathResolutionUtility.join(messageCommandDirectoryPath, commandFile));
                clientInstance.commands.set(commandModuleInstance.name, commandModuleInstance);
                this.discoveredMessageCommands++;
            }
        }
        
        return this;
    }

    executeSlashCommandDiscovery(clientInstance) {
        const slashCommandDirectoryPath = SystemPathResolutionUtility.join(__dirname, 'commands', 'slash');
        
        if (FileSystemOperationalInterface.existsSync(slashCommandDirectoryPath)) {
            const discoveredCommandFiles = FileSystemOperationalInterface
                .readdirSync(slashCommandDirectoryPath)
                .filter(fileEntity => fileEntity.endsWith('.js'));
            
            for (const commandFile of discoveredCommandFiles) {
                const commandModuleInstance = require(SystemPathResolutionUtility.join(slashCommandDirectoryPath, commandFile));
                clientInstance.slashCommands.set(commandModuleInstance.data.name, commandModuleInstance);
                this.discoveredSlashCommands++;
            }
        }
        
        return {
            totalCommands: this.discoveredMessageCommands + this.discoveredSlashCommands
        };
    }
}

class EventHandlerRegistrationService {
    constructor() {
        this.discoveredEventHandlers = [];
        this.boundEventHandlers = 0;
    }

    executeEventDiscovery() {
        const eventHandlerDirectoryPath = SystemPathResolutionUtility.join(__dirname, 'events');
        const discoveredEventFiles = FileSystemOperationalInterface
            .readdirSync(eventHandlerDirectoryPath)
            .filter(fileEntity => fileEntity.endsWith('.js'));
        
        this.discoveredEventHandlers = discoveredEventFiles.map(eventFile => {
            return require(SystemPathResolutionUtility.join(eventHandlerDirectoryPath, eventFile));
        });
        
        return this;
    }

    bindEventHandlers(clientInstance) {
        for (const eventHandlerInstance of this.discoveredEventHandlers) {
            if (eventHandlerInstance.once) {
                clientInstance.once(eventHandlerInstance.name, (...eventArguments) => 
                    eventHandlerInstance.execute(...eventArguments, clientInstance));
            } else {
                clientInstance.on(eventHandlerInstance.name, (...eventArguments) => 
                    eventHandlerInstance.execute(...eventArguments, clientInstance));
            }
            this.boundEventHandlers++;
        }
        
        return {
            totalEvents: this.boundEventHandlers
        };
    }
}


class AudioSubsystemIntegrationManager {
    constructor(clientInstance) {
        this.clientRuntimeInstance = clientInstance;
        this.initializeAudioEventHandlers();
    }
    

    initializeAudioEventHandlers() {
        this.clientRuntimeInstance.on('raw', (gatewayEventPayload) => {
            this.processGatewayVoiceStateEvent(gatewayEventPayload);
        });
        
        this.bindRiffyEventHandlers();
    }

    processGatewayVoiceStateEvent(eventPayload) {
        const validVoiceStateEvents = ['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'];
        
        if (!validVoiceStateEvents.includes(eventPayload.t)) return;
        
        this.clientRuntimeInstance.riffy.updateVoiceState(eventPayload);
    }

    bindRiffyEventHandlers() {
        this.clientRuntimeInstance.riffy.on('nodeConnect', (audioNodeInstance) => {
            console.log(`🎵 Lavalink node "${audioNodeInstance.name}" connected`);
        });
        
        this.clientRuntimeInstance.riffy.on('nodeError', (audioNodeInstance, nodeErrorException) => {
            console.error(`🔴 Lavalink node "${audioNodeInstance.name}" error:`, nodeErrorException.message);
        });
    }
}


const enterpriseApplicationManager = new DiscordClientRuntimeManager();
enterpriseApplicationManager.executeApplicationBootstrap();


module.exports = enterpriseApplicationManager.clientRuntimeInstance;
shiva.initialize(enterpriseApplicationManager.clientRuntimeInstance);