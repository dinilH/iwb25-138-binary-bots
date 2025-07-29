import ballerina/http;
import ballerina/log;

// Simple wellness entry type
type WellnessEntry record {
    string userId;
    string date;
    int mood;
    int energy;
    decimal sleep;
    int water;
    string notes?;
};

// In-memory storage
map<WellnessEntry[]> wellnessStore = {};

// Wellness API service
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://localhost:3001"],
        allowCredentials: false,
        allowHeaders: ["Content-Type"],
        allowMethods: ["GET", "POST", "OPTIONS"]
    }
}
service /api/wellness on new http:Listener(8082) {

    // Health check
    resource function get health() returns json {
        return {
            success: true,
            message: "Wellness API is running",
            timestamp: "2025-07-28T15:00:00Z"
        };
    }

    // Add wellness entry
    resource function post entries(@http:Payload WellnessEntry entry) returns json {
        log:printInfo("Adding wellness entry for user: " + entry.userId);
        
        WellnessEntry[] userEntries = wellnessStore[entry.userId] ?: [];
        userEntries.push(entry);
        wellnessStore[entry.userId] = userEntries;
        
        return {
            success: true,
            message: "Wellness entry added successfully",
            data: entry.toJson()
        };
    }

    // Get wellness entries for a user
    resource function get users/[string userId]/entries() returns json {
        log:printInfo("Fetching entries for user: " + userId);
        
        WellnessEntry[] entries = wellnessStore[userId] ?: [];
        
        return {
            success: true,
            data: entries.toJson()
        };
    }
}
