const { Client: AttClient } = require('att-client');
const { attConfig } = require('./UserLogin');
const { Prefab } = require('att-string-transcoder');
const { Liquid } = require('att-liquids');
const bot = new AttClient(attConfig);
const fs = require('fs');
const databaseFileName = 'database.json';

function jsonContainsString(obj, searchString) {
    if (typeof obj === 'string') {
      if (obj.indexOf(searchString) !== -1) {
        return true;
      }
    }
  
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (jsonContainsString(obj[i], searchString)) {
          return true;
        }
      }
    }
  
    if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        if (jsonContainsString(obj[key], searchString)) {
          return true;
        }
      }
    }
    return false;
} 

function calculateVelocity(facingDirection, speed) {
    const normalizedDirection = facingDirection.normalize();

    const velocity = normalizedDirection.multiply(speed);
    
    return velocity;
}

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        return new Vector3(this.x / length, this.y / length, this.z / length);
    }

    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
}

function readDB() {
    try {
        const data = fs.readFileSync(databaseFileName, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveDatabase(data) {
    fs.writeFileSync(databaseFileName, JSON.stringify(data), 'utf8');
}

function pushToDB(newData) {
    const database = readDB();
    database.push(newData);
    saveDatabase(database);
}

function spliceFromDB(dataToRemove) {
    const database = readDB();
    const indexToRemove = database.findIndex(item => JSON.stringify(item) === JSON.stringify(dataToRemove));
    if (indexToRemove !== -1) {
        database.splice(indexToRemove, 1);
        saveDatabase(database);
        return true;
    }
    return false;
}

function getDistance(pos1, pos2){

    deltaX = pos1[0] - pos2[0];
    deltaY = pos1[1] - pos2[1];
    deltaZ = pos1[2] - pos2[2];
    
    distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    
    return distance;
}

try {

    bot.on('connect', async (connection) => {
        try {
            function say(player, message, duration) {
                connection.send(`player message "${player}" "${message}" ${duration}`);
            }
            console.log(connection.server.name);
            setInterval(function() {
                if (bot.openServerConnection != 3) {
                    connection.send(`player list-detailed`).then(resp2 => {
                        for (var i = -1; i != 12; i++) {
                            try {
                                if (jsonContainsString(resp2.data.Result[i], " ")) {
                                    const player = resp2.data.Result[i];
                                    const id = player.id;
                                    const leftHandPosition = player.LeftHandPosition[1];
                                    const rightHandPosition = player.RightHandPosition[1];
                                    const handsTogether = getDistance(player.RightHandPosition, player.LeftHandPosition) <= 0.09;
                                    const handsOverHead = rightHandPosition > player.HeadPosition[1] && player.HeadPosition[1] < leftHandPosition;
                                    const rightHandOverHead = rightHandPosition > player.HeadPosition[1] && player.HeadPosition[1] > leftHandPosition;
                                    const leftHandOverHead = rightHandPosition < player.HeadPosition[1] && player.HeadPosition[1] < leftHandPosition;
                                    const handsApart = getDistance(player.RightHandPosition, player.LeftHandPosition) >= 1.0 && !rightHandOverHead && !leftHandOverHead;
                                    const rHandOnFace = getDistance(player.RightHandPosition, player.HeadPosition) <= 0.21;
                                    const lHandOnFace = getDistance(player.LeftHandPosition, player.HeadPosition) <= 0.21;
                                    const spellChamber = [-842.362,143.807,36.189];
                                    const isInSpellChamber = getDistance(player.Position, spellChamber) < 4.4;

                                    function orbitPlayer(spacing, despawnTimeMS, orbitItem, set1Height, set2Height, spacing, isStatic, isOnFire, rotation) {
                                        const orbit = new Prefab("Ore_Training")
                                        .setPosition({x: spacing, y: spacing, z: spacing})

                                        // Section 1
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing + spacing, y: spacing + set1Height, z: spacing})
                                        )
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing, y: spacing + set1Height, z: spacing + spacing})
                                        )

                                        // Section 2
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing - spacing, y: spacing + set1Height, z: spacing})
                                        )
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing, y: spacing + set1Height, z: spacing - spacing})
                                        )

                                        // Section 3
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing - spacing, y: spacing + set1Height, z: spacing + spacing})
                                        )
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing + spacing, y: spacing + set1Height, z: spacing - spacing})
                                        )
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing + spacing, y: spacing + set1Height, z: spacing + spacing})
                                        )

                                        // Set 2 ---------------------------------------------------------------------------------------------------------------
                                        // Section 1
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing + spacing, y: spacing + set2Height, z: spacing})
                                        )
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing, y: spacing + set2Height, z: spacing + spacing})
                                        )

                                        // Section 2
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing - spacing, y: spacing + set2Height, z: spacing})
                                        )
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing, y: spacing + set2Height, z: spacing - spacing})
                                        )

                                        // Section 3
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing - spacing, y: spacing + set2Height, z: spacing + spacing})
                                        )
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing + spacing, y: spacing + set2Height, z: spacing - spacing})
                                        )
                                        .addChildPrefab("Ore_Training_56294", new Prefab(orbitItem)
                                            .setOnFire(isOnFire)
                                            .setKinematic(isStatic)
                                            .setRotation({x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3]})
                                            .setPosition({x: spacing + spacing, y: spacing + set2Height, z: spacing + spacing})
                                        );
                                        
                                        connection.send(`spawn string ${id} ${orbit.toSaveString()}`).then(spawnData2 => {
                                            setTimeout(function() {
                                                connection.send(`wacky destroy ${spawnData2.data.Result[0].Identifier}`);
                                            }, despawnTimeMS);
                                        });
                                    }

                                    if (handsOverHead) {
                                        const transformationSpells = [
                                            {holdingItem: "MRK Fuel Core", spawnString: false, spawnItem: "coal 25", spellName: "Fuel Core Transformation"},
                                            {holdingItem: "MushroomRed Full Ripe", spawnString: true, spawnItem: "MushroomBrownFullRipe", spellName: "Mushroom Transformation"},
                                            {holdingItem: "Crystal Gem Blue", spawnString: false, stat: "speed 2 8", spellName: "Crystal Speed Transformation"},
                                            {holdingItem: "Sandstone Stone", spawnString: false, cmd: `spawn string ${id} 23644,100,23644,0,0,0,0,0,0,1065353216,1065353216,4179293747,359,536870912,268435456,0,35127296,0,35387392,377,2147483648,67109092,2223344640,0,0,0,0,|1,4179293747,1,`, spellName: "Glass Transformation"},
                                            {holdingItem: "Crystal Lance Blue", spawnString: false, spawnItem: "crystalgemblue 7", spellName: "Crystal Lance Transformation"},
                                            {holdingItem: "Crystal Pick Blue", spawnString: false, spawnItem: "crystalgemblue 5", spellName: "Crystal Pick Transformation"},
                                            {holdingItem: "Crystal Sword Blue", spawnString: false, spawnItem: "crystalgemblue 6", spellName: "Crystal Sword Transformation"},
                                            {holdingItem: "Wyrm Arm", spawnString: false, spawnItem: "SoftFabricLargeRoll daisredleather", spellName: "Wrym Leather Transformation"},
                                            {holdingItem: "Babu Leg Full Cooked", spawnString: false, stat2: "hunger 15", spellName: "Hunger Transformation"},
                                            {holdingItem: "Spriggull Feather Purple", spawnString: false, spawnItem: "SpriggullDrumstickFullCooked 10", spellName: "Spriggull Meat Transformation"},
                                            {holdingItem: "Spriggull Feather Green", spawnString: false, stat: "speed 0.4 300", spellName: "Spriggull Speed Transformation"},
                                            {holdingItem: "Puzzle Orb 1", spawnString: false, cmd: `Player progression pathlevelup ${id} Melee`, spellName: "Melee EXP Transformation"},
                                            {holdingItem: "Smelter Gem 1", spawnString: false, spawnItem: "crystalgemblue 25", spellName: "Smelter Gem Transformation"},
                                            {holdingItem: "Smelter Gem 2", spawnString: false, spawnItem: "crystalgemblue 45", spellName: "Smelter Gem Transformation"},
                                            {holdingItem: "Smelter Gem 3", spawnString: false, spawnItem: "crystalgemblue 65", spellName: "Smelter Gem Transformation"}
                                        ];

                                        connection.send(`player inventory ${id}`).then(resp => {
                                            const inventory = resp.data.Result[0];
                                            const RightHand = inventory.RightHand;
                                            const LeftHand = inventory.LeftHand;
                                            console.log(RightHand);
                                            function makeSpell(leftHand, rightHand, spellName, callback) {
                                                if (jsonContainsString(LeftHand, leftHand) && jsonContainsString(RightHand, rightHand)) {
                                                    connection.send(`wacky destroy ${LeftHand.Identifier}`);
                                                    connection.send(`wacky destroy ${RightHand.Identifier}`);
                                                    say(id, spellName, 2);
                                                    callback();
                                                } else if (jsonContainsString(LeftHand, rightHand) && jsonContainsString(RightHand, leftHand)) {
                                                    connection.send(`wacky destroy ${LeftHand.Identifier}`);
                                                    connection.send(`wacky destroy ${RightHand.Identifier}`);
                                                    say(id, spellName, 2);
                                                    callback();
                                                }
                                            }

                                            connection.send(`player progression checkallxp ${id}`).then(exp => {
                                                const miningExp = exp.data.Result[0].Paths[2].CurrentExperience;
                                                const woodcuttingExp = exp.data.Result[0].Paths[1].CurrentExperience;
                                                const forgingExp = exp.data.Result[0].Paths[0].CurrentExperience;
                                                const combatExp = exp.data.Result[0].Paths[5].CurrentExperience;
                                                const rangedExp = exp.data.Result[0].Paths[6].CurrentExperience;
                                                
                                                ////Crystal Rain
                                                //makeSpell("Crystal Gem Blue", "MRK Fuel Core", "Crystal Rain", function() {
                                                //    orbitPlayer(1000, "Forge_Training", 1, 2, 4, true, true, [0.0, 0.0, 0.0, 0.0]);
                                                //    setTimeout(function() {
                                                //        orbitPlayer(1000, "Forge_Training", 2, 3, 5, true, true, [0.0, 0.0, 0.0, 0.0]);
                                                //    }, 100);
                                                //    setTimeout(function() {
                                                //        orbitPlayer(1000, "Forge_Training", 4, 5, 6, true, true, [0.0, 0.0, 0.0, 0.0]);
                                                //    }, 200);
                                                //    setTimeout(function() {
                                                //        orbitPlayer(1000, "Forge_Training", 6, 7, 7, true, true, [0.0, 0.0, 0.0, 0.0]);
                                                //    }, 300);
                                                //    setTimeout(function() {
                                                //        orbitPlayer(1000, "Forge_Training", 8, 9, 8, true, true, [0.0, 0.0, 0.0, 0.0]);
                                                //    }, 400);
                                                //    setTimeout(function() {
                                                //        orbitPlayer(1000, "Forge_Training", 10, 11, 9, true, true, [0.0, 0.0, 0.0, 0.0]);
                                                //    }, 500);
                                                //    setTimeout(function() {
                                                //        orbitPlayer(1000, "Forge_Training", 12, 13, 10, true, true, [0.0, 0.0, 0.0, 0.0]);
                                                //    }, 700);
                                                //    setTimeout(function() {
                                                //        orbitPlayer(1000, "Forge_Training", 14, 15, 11, true, true, [0.0, 0.0, 0.0, 0.0]);
                                                //    }, 900);
                                                //    setTimeout(function() {
                                                //        connection.send(`time toggle`);
                                                //    }, 900);
                                                //});
                                            
                                                //Healing Burst
                                                makeSpell("Healing Pod", "Explosive Spike", "Healing Burst", function() {
                                                    connection.send(`player set-stat ${id} health 1000`);
                                                    connection.send(`spawn string ${id} 44360,2492,44360,0,0,0,0,0,0,1065353216,1065353216,2290978823,418,0,0,0,0,0,0,1065353216,0,271056896,0,0,0,0,0,0,536872853,2147489193,0,0,0,0,0,0,133169152,133169152,286372352,3758096436,1073741824,0,0,0,0,0,133169152,0,33882112,0,0,0,0,0,0,33554553,1476395354,2415919104,0,0,0,0,0,8323072,8323072,17898272,234881027,1140850688,0,0,0,0,0,8323072,0,2117632,0,0,0,0,0,0,2097159,2508193813,2835349504,0,0,0,0,0,520192,520192,1118642,14680064,876609536,0,0,0,0,0,520192,0,132352,0,0,0,0,0,0,131072,2035810305,1519386624,0,0,0,0,0,32512,32512,69915,537788416,54788096,0,0,0,0,0,32512,0,8272,0,0,0,0,0,0,8192,127238144,363397120,0,0,0,0,0,2032,2032,4369,2986401792,3424256,0,0,0,0,0,2032,0,517,0,0,0,0,0,0,512,7952384,22712320,0,0,0,0,0,127,127,273,455085568,214016,0,0,0,0,0,127,0,32,1342177280,0,0,0,0,0,32,497024,1419520,0,0,0,0,0,7,4026531847,4026531857,296878304,13376,0,0,0,0,0,7,4026531840,2,83886080,0,0,0,0,0,2,31064,88720,0,0,0,0,0,0,2130706432,2130706433,286990350,836,0,0,0,0,0,0,2130706432,0,542113792,0,0,0,0,0,0,536872853,2147489193,0,0,0,0,0,0,133169152,133169152,286372352,3758096436,1073741824,0,0,0,0,0,133169152,0,33882112,0,0,0,0,0,0,33554553,1476395354,2415919104,0,0,0,0,0,8323072,8323072,17898272,234881027,1140850688,0,0,0,0,0,8323072,0,2117632,0,0,0,0,0,0,2097159,2508193813,2835349504,0,0,0,0,0,520192,520192,1118642,14680064,876609536,0,0,0,0,0,520192,0,132352,0,0,0,0,0,0,131072,2035810305,1519386624,0,0,0,0,0,32512,32512,69915,537788416,54788096,0,0,0,0,0,32512,0,8272,0,0,0,0,0,0,8192,127238144,363397120,0,0,0,0,0,2032,2032,4369,2986401792,3424256,0,0,0,0,0,2032,0,517,0,0,0,0,0,0,512,7952384,22712320,0,0,0,0,0,127,127,273,455085568,214016,0,0,0,0,0,127,0,32,1342177280,0,0,0,0,0,32,497024,1419520,0,0,0,0,0,7,4026531847,4026531857,296878304,13376,0,0,0,0,0,7,4026531840,2,83886080,0,0,0,0,0,2,31064,88720,0,0,0,0,0,0,2130706432,2130706433,286990350,836,0,0,0,0,0,0,2130706432,0,542113792,0,0,0,0,0,0,536872853,2147489193,0,0,0,0,0,0,133169152,133169152,286372352,3758096436,1073741824,0,0,0,0,0,133169152,0,33882112,0,0,0,0,0,0,33554553,1476395354,2415919104,0,0,0,0,0,8323072,8323072,17898272,234881027,1140850688,0,0,0,0,0,8323072,0,2117632,0,0,0,0,0,0,2097159,2508193813,2835349504,0,0,0,0,0,520192,520192,1118642,14680064,876609536,0,0,0,0,0,520192,0,132352,0,0,0,0,0,0,131072,2035810305,1519386624,0,0,0,0,0,32512,32512,69915,537788416,54788096,0,0,0,0,0,32512,0,8272,0,0,0,0,0,0,8192,127238144,363397120,0,0,0,0,0,2032,2032,4369,2986401792,3424256,0,0,0,0,0,2032,0,517,0,0,0,0,0,0,512,7952384,22712320,0,0,0,0,0,127,127,273,455085568,214016,0,0,0,0,0,127,0,32,1342177280,0,0,0,0,0,0,|1,2290978823,1,`)
                                                });

                                                //Crystal Burst
                                                makeSpell("Crystal Gem Blue", "Explosive Spike", "Crystal Burst", function() {
                                                    connection.send(`spawn string ${id} 37926,2276,37926,0,0,0,0,0,0,1065353216,1065353216,2290978823,418,0,0,0,0,0,0,1065353216,0,273154048,0,0,0,0,0,0,536878779,2147488388,3221225472,0,0,0,0,0,133169152,133169152,286372352,3758096436,1073741824,0,0,0,0,0,133169152,0,33882112,100990976,0,0,0,0,0,33554923,3087008040,1275068416,0,0,0,0,0,8323072,8323072,17898272,234881027,1140850688,0,0,0,0,0,8323072,0,2117632,2117632,0,0,0,0,0,2097182,3145728018,2227175424,0,0,0,0,0,520192,520192,1118642,14680064,876609536,0,0,0,0,0,520192,132352,132352,0,0,0,0,0,0,131073,3954704385,676069376,0,0,0,0,0,32512,32512,69915,537788416,54788096,0,0,0,0,0,32512,24656,8272,0,0,0,0,0,0,8192,515604480,310689792,0,0,0,0,0,2032,2032,4369,2986401792,3424256,0,0,0,0,0,2032,0,1545,1541,0,0,0,0,0,512,32225280,19418112,0,0,0,0,0,127,127,273,455085568,214016,0,0,0,0,0,127,0,96,2415919136,1342177280,0,0,0,0,32,2014080,1213632,0,0,0,0,0,7,4026531847,4026531857,296878304,13376,0,0,0,0,0,7,4026531842,83886086,150994944,0,0,0,0,0,2,125880,75852,0,0,0,0,0,0,2130706432,2130706433,286990350,836,0,0,0,0,0,0,2130706432,1615855616,1620049920,0,0,0,0,0,0,536878779,2147488388,3221225472,0,0,0,0,0,133169152,133169152,286372352,3758096436,1073741824,0,0,0,0,0,133169152,0,33882112,100990976,0,0,0,0,0,33554923,3087008040,1275068416,0,0,0,0,0,8323072,8323072,17898272,234881027,1140850688,0,0,0,0,0,8323072,0,2117632,2117632,0,0,0,0,0,2097182,3145728018,2227175424,0,0,0,0,0,520192,520192,1118642,14680064,876609536,0,0,0,0,0,520192,132352,132352,0,0,0,0,0,0,131073,3954704385,676069376,0,0,0,0,0,32512,32512,69915,537788416,54788096,0,0,0,0,0,32512,24656,8272,0,0,0,0,0,0,8192,515604480,310689792,0,0,0,0,0,2032,2032,4369,2986401792,3424256,0,0,0,0,0,2032,0,1545,1541,0,0,0,0,0,512,32225280,19418112,0,0,0,0,0,127,127,273,455085568,214016,0,0,0,0,0,127,0,96,2415919136,1342177280,0,0,0,0,32,2014080,1213632,0,0,0,0,0,7,4026531847,4026531857,296878304,13376,0,0,0,0,0,7,4026531842,83886086,150994944,0,0,0,0,0,2,125880,75852,0,0,0,0,0,0,2130706432,2130706433,286990350,836,0,0,0,0,0,0,2130706432,1615855616,1620049920,0,0,0,0,0,0,536878779,2147488388,3221225472,0,0,0,0,0,133169152,133169152,286372352,3758096436,1073741824,0,0,0,0,0,133169152,0,33816576,100990976,0,0,0,0,0,33554923,3087008040,1275068416,0,0,0,0,0,8323072,8323072,17898272,234881027,1140850688,0,0,0,0,0,8323072,0,2105344,2117632,0,0,0,0,0,2097182,3145728018,2227175424,0,0,0,0,0,520192,520192,1118642,14680064,876609536,0,0,0,0,0,520192,132352,131072,0,0,0,0,0,0,131073,3954704385,676069376,0,0,0,0,0,32512,32512,69915,537788416,54788096,0,0,0,0,0,32512,24656,8128,0,0,0,0,0,0,0,|1,2290978823,1,`);
                                                });

                                                //Crystal Acid Grenade
                                                makeSpell("Crystal Gem Blue", "Dynamite", "Crystal Acid Grenade", function() {
                                                    connection.send(`spawn string ${id} 47150,108,47150,0,0,0,0,0,0,1065353216,1065353216,2290978823,418,0,0,0,0,0,0,1065353216,2147483648,0,0,0,0,0,0,0,0,|1,2290978823,1,`).then(spawnData => {
                                                        try {
                                                            const Identifier = spawnData.data.Result[0].Identifier;
                                                            setTimeout(function() {
                                                                connection.send(`select get ${Identifier}`).then(finalPos => {
                                                                    const position = finalPos.data.Result.Position;
                                                                    const cAcid = new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 6.9, z:0.0}).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 4.0, y: 6.9, z:0.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: -4.0, y: 6.9, z:0.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 6.9, z: 4.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 6.9, z: -4.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 2.0, y: 2.5, z: 2.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: -2.0, y: 2.5, z: -2.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: -2.0, y: 2.5, z: 2.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 2.0, y: 2.5, z: -2.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 4.0, y: 2.5, z:0.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: -4.0, y: 2.5, z:0.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 2.5, z: 4.0})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 2.5, z: -4.0}))
                                                                    const gAcid = new Prefab("Wyrm_Spit").setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 8.9, z:0.0})
                                                                    const gAcidRing = new Prefab("Wyrm_Spit")
                                                                    .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                    .setVelocity({x: 3.0, y: 6.9, z: 0.0})
                                                                    .addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: 2.0, y: 6.9, z: 1.0})
                                                                    ).addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: 1.0, y: 6.9, z: 2.0})
                                                                    ).addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: 0.0, y: 6.9, z: 3.0})
                                                                    )
                                                                    
                                                                    .addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: -3.0, y: 6.9, z: 0.0})
                                                                    ).addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: -2.0, y: 6.9, z: 1.0})
                                                                    ).addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: -1.0, y: 6.9, z: 2.0})
                                                                    ).addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: 0.0, y: 6.9, z: 3.0})
                                                                    )

                                                                    .addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: .0, y: 6.9, z: 0.0})
                                                                    ).addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: 2.0, y: 6.9, z: -1.0})
                                                                    ).addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: 1.0, y: 6.9, z: -2.0})
                                                                    ).addChildPrefab("Wyrm_Spit_62050", new Prefab("Wyrm_Spit")
                                                                        .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                        .setVelocity({x: 0.0, y: 6.9, z: -3.0})
                                                                    )
                                                                    

                                                                    const greenAcid = setInterval(function() {
                                                                        connection.send(`spawn string-raw ${gAcid.toSaveString()}`);
                                                                    }, 500);
                                                                    setTimeout(function() {
                                                                        clearInterval(greenAcid);
                                                                        connection.send(`spawn string-raw ${gAcidRing.toSaveString()}`);
                                                                    }, 2500);
                                                                    connection.send(`spawn string-raw ${cAcid.toSaveString()}`);
                                                                    connection.send(`wacky destroy ${Identifier}`);
                                                                }).catch(error => {
                                                                });
                                                            }, 5000);
                                                        } catch {
                                                        }
                                                    });
                                                });
                                            
                                                //Fire Cannon
                                                makeSpell("Coal", "Grass Clump", "Fire Cannon", function() {
                                                    const speed = 40.0;
                                                    const velocity = calculateVelocity(new Vector3(player.HeadForward[0], player.HeadForward[1], player.HeadForward[2]), speed);
                                                    console.log(velocity)
                                                    const fireBall = new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z}).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z}))
                                                    connection.send(`spawn string ${id} ${fireBall.toSaveString()}`).then(spawnData => {
                                                        setTimeout(function() {
                                                            connection.send(`wacky destroy ${spawnData.data.Result.Identifier}`);

                                                        }, 4000);
                                                    });
                                                });

                                                //Fire Ring
                                                makeSpell("MRK Fuel Core", "Grass Clump", "Fire Ring", function() {
                                                    const speed = 40.0;
                                                    const velocity = calculateVelocity(new Vector3(player.HeadForward[0], player.HeadForward[1], player.HeadForward[2]), speed);
                                                    console.log(velocity)
                                                    const fireBall = new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z}).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z}).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})))
                                                    connection.send(`spawn string ${id} ${fireBall.toSaveString()}`).then(spawnData => {
                                                        setTimeout(function() {
                                                            connection.send(`wacky destroy ${spawnData.data.Result.Identifier}`);

                                                        }, 4000);
                                                    });
                                                    orbitPlayer(player.Position, 4000, "Forge_Training", 0, 2, 4, true, true, [0.0, 0.0, 0.0, 0.0]);
                                                });

                                                //Fire Grenade
                                                makeSpell("Coal", "Dynamite", "Fire Grenade", function() {
                                                    connection.send(`spawn string ${id} 47150,108,47150,0,0,0,0,0,0,1065353216,1065353216,2290978823,418,0,0,0,0,0,0,1065353216,2147483648,0,0,0,0,0,0,0,0,|1,2290978823,1,`).then(spawnData => {
                                                        try {
                                                            const Identifier = spawnData.data.Result[0].Identifier;
                                                            setTimeout(function() {
                                                                connection.send(`select get ${Identifier}`).then(finalPos => {
                                                                    const position = finalPos.data.Result.Position;
                                                                    const fire = new Prefab("Flame_Step_Effect_Proto").setPosition({x: position[0], y: position[1], z: position[2]}).addChildPrefab("Flame_Step_Effect_Proto_26204", new Prefab("Flame_Step_Effect_Proto").setPosition({x: position[0], y: position[1] + 1, z: position[2]})).addChildPrefab("Flame_Step_Effect_Proto_26204", new Prefab("Flame_Step_Effect_Proto").setPosition({x: position[0], y: position[1] + 2, z: position[2]})).addChildPrefab("Flame_Step_Effect_Proto_26204", new Prefab("Flame_Step_Effect_Proto").setPosition({x: position[0], y: position[1] + 3, z: position[2]})).addChildPrefab("Flame_Step_Effect_Proto_26204", new Prefab("Flame_Step_Effect_Proto").setPosition({x: position[0], y: position[1] + 4, z: position[2]})).addChildPrefab("Flame_Step_Effect_Proto_26204", new Prefab("Flame_Step_Effect_Proto").setPosition({x: position[0], y: position[1] + 5, z: position[2]}))
                                                                    const fireGrass = new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0}).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0})).addChildPrefab("Grass_Clump_12138", new Prefab("Grass_Clump").setOnFire().setPosition({x: position[0], y: position[1], z: position[2]}).setVelocity({x: 0.0, y: 20.0, z: 0.0}))
                                                                    connection.send(`spawn string-raw ${fireGrass.toSaveString()}`);
                                                                    connection.send(`spawn string-raw ${fire.toSaveString()}`);
                                                                    connection.send(`wacky destroy ${Identifier}`);
                                                                    setTimeout(function() {
                                                                        connection.send(`wacky destroy-free GrassClump`);
                                                                    }, 20000);
                                                                }).catch(error => {
                                                                    console.log(error)
                                                                });
                                                            }, 5000);
                                                        } catch {
                                                        }
                                                    });
                                                });

                                                //Earth Grenade
                                                makeSpell("Redwood Gotera Core", "Dynamite", "Earth Grenade", function() {
                                                    connection.send(`spawn string ${id} 47150,108,47150,0,0,0,0,0,0,1065353216,1065353216,2290978823,418,0,0,0,0,0,0,1065353216,2147483648,0,0,0,0,0,0,0,0,|1,2290978823,1,`).then(spawnData => {
                                                        try {
                                                            const Identifier = spawnData.data.Result[0].Identifier;
                                                            setTimeout(function() {
                                                                connection.send(`select get ${Identifier}`).then(finalPos => {
                                                                    const position = finalPos.data.Result.Position;
                                                                    const spikeyGrass = new Prefab("Bramble_Obstacle")
                                                                    .setPosition({x: position[0], y: position[1], z: position[2]}).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle").setScale(2.7).setPosition({x: position[0] + 2, y: position[1], z: position[2]})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + -2, y: position[1], z: position[2]})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2] + 2})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2] - 2})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2]})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + -2, y: position[1], z: position[2]})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2] + 2})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2] - 2})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2]})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + -2, y: position[1], z: position[2]})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2] + 2})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2] - 2})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2]})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + -2, y: position[1], z: position[2]})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2] + 2})).addChildPrefab("Bramble_Obstacle_59546", new Prefab("Bramble_Obstacle")    .setPosition({x: position[0] + 2, y: position[1], z: position[2] - 2}))
                                                                    const geyser = new Prefab("Targeted_Geyser", {position: {x: position[0], y: position[1], z: position[2]}, scale: 2.3});
                                                                    connection.send(`spawn string-raw ${geyser.toSaveString()}`).then(spawnData2 => {
                                                                        setTimeout(function() {
                                                                            connection.send(`wacky destroy ${spawnData2.data.Result.Identifier}`);
                                                                        }, 4000);
                                                                    });
                                                                    connection.send(`spawn string-raw ${spikeyGrass.toSaveString()}`).then(spawnData2 => {
                                                                        setTimeout(function() {
                                                                            connection.send(`wacky destroy ${spawnData2.data.Result.Identifier}`);
                                                                        }, 4000);
                                                                    });
                                                                    connection.send(`spawn string-raw ${spikeyGrass.toSaveString()}`).then(spawnData2 => {
                                                                        setTimeout(function() {
                                                                            connection.send(`wacky destroy ${spawnData2.data.Result.Identifier}`);
                                                                        }, 4000);
                                                                    });
                                                                    connection.send(`wacky destroy ${Identifier}`);
                                                                }).catch(error => {
                                                                });
                                                            }, 5000);
                                                        } catch {
                                                        }
                                                    });
                                                });

                                                //Earth Grenade
                                                makeSpell("Explosive Spike", "Turabada Arm", "Turabada Strike", function() {
                                                    connection.send(`spawn string ${id} 47150,108,47150,0,0,0,0,0,0,1065353216,1065353216,2290978823,418,0,0,0,0,0,0,1065353216,2147483648,0,0,0,0,0,0,0,0,|1,2290978823,1,`).then(spawnData => {
                                                        try {
                                                            const Identifier = spawnData.data.Result[0].Identifier;
                                                            setTimeout(function() {
                                                                connection.send(`select get ${Identifier}`).then(finalPos => {
                                                                    const position = finalPos.data.Result.Position;
                                                                    const turabadaRock = new Prefab("Turabada_Spawner_Automatic")
                                                                    .addChildPrefab("caveRock_34072", new Prefab("Turabada_Spawner_Automatic")
                                                                    .setPosition({x: position[0], y: position[1] + 28, z: position[2]})
                                                                    .setVelocity({x: 0.0, y: -9, z: 0.0})
                                                                    .setOnFire()
                                                                    )
                                                                    .setPosition({x: position[0], y: position[1] + 28, z: position[2]})
                                                                    .setVelocity({x: 0.0, y: -9, z: 0.0})
                                                                    for (var i = 0; i != 1; i++) {
                                                                        connection.send(`spawn string-raw ${turabadaRock.toSaveString()}`).then(spawnData2 => {
                                                                            setTimeout(function() {
                                                                                connection.send(`wacky destroy ${spawnData2.data.Result.Identifier}`);
                                                                            }, 4000);
                                                                        });
                                                                    }
                                                                    connection.send(`wacky destroy ${Identifier}`);
                                                                }).catch(error => {
                                                                });
                                                            }, 5000);
                                                        } catch {
                                                        }
                                                    });
                                                });

                                                //Crystal Blast
                                                makeSpell("MRK Molten Core", "Crystal Gem Blue", "Crystal Blast", function() {
                                                    const speed = 10.0;
                                                    const velocity = calculateVelocity(new Vector3(player.HeadForward[0], player.HeadForward[1] - 0.4, player.HeadForward[2]), speed);
                                                    console.log(velocity)
                                                    const darts = new Prefab("Wyrm_Crystal_Spit")
                                                    .setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})
                                                    .addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setVelocity({x: velocity.x, y: velocity.y + 5, z: velocity.z})).addChildPrefab("Wyrm_Crystal_Spit_62050", new Prefab("Wyrm_Crystal_Spit").setVelocity({x: velocity.x, y: velocity.y + 4, z: velocity.z}))
                                                    connection.send(`spawn string ${id} ${darts.toSaveString()}`);
                                                });
                                            
                                                makeSpell("MRK Molten Core", "Explosive Spike", "Explosive Blast", function() {
                                                    const speed = 10.0;
                                                    const velocity = calculateVelocity(new Vector3(player.HeadForward[0], player.HeadForward[1], player.HeadForward[2]), speed);
                                                    console.log(velocity)
                                                    const darts = new Prefab("Ore_Training").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z}).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z})).addChildPrefab("Ore_Training_56294", new Prefab("Explosive_Spike").setVelocity({x: velocity.x, y: velocity.y + 3, z: velocity.z}))
                                                    connection.send(`wacky destroy-free OreTraining`);  
                                                    connection.send(`spawn string ${id} ${darts.toSaveString()}`);
                                                });
                                            
                                                makeSpell("Redwood Gotera Core", "Hebios Guard", "Loot Summon", function() {
                                                    connection.send(`spawn ${id} StorageCrateRedwoodClosed`);
                                                    connection.send(`spawn ${id} StorageCrateRedwoodClosed`);
                                                    connection.send(`spawn ${id} StorageCrateRedwoodClosed`);
                                                    connection.send(`spawn ${id} DiggingDirtParts`);
                                                });

                                                //Charged Explosion
                                                makeSpell("Dynamite", "MRK Fuel Core", "Charged Explosion", function() {
                                                    connection.send(`spawn ${id} 5316`);
                                                });

                                                makeSpell("Redwood Gotera Core", "Gotera Seedling Orb", "Spore Strike", function() {
                                                    orbitPlayer(player.Position, 4000, "Gotera_Seedling_Orb", 7, 14, 4, true, true, [0.0, 0.0, 0.0, 0.0]);
                                                    const strike = new Prefab("Coal_Training").setPosition({x: player.Position[0] + 5, y: player.Position[1] + 200, z: player.Position[2]}).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0})).addChildPrefab("Coal_Training_51606", new Prefab("Gotera_Seedling_Orb")    .setPosition({x: player.Position[0] + 5, y: player.Position[1] + 35, z: player.Position[2]})    .setVelocity({x: 0.0, y: -10.5, z: 0.0}))

                                                    setTimeout(function() {
                                                        connection.send(`spawn string-raw ${strike.toSaveString()}`).then(spawnData2 => {
                                                            setTimeout(function() {
                                                                connection.send(`wacky destroy ${spawnData2.data.Result.Identifier}`);
                                                            }, 5500);
                                                        });
                                                    }, 2400);
                                                });
                                            
                                                makeSpell("Geode", "Geode", "Bio Grenade", function() {
                                                    connection.send(`spawn string ${id} 47150,108,47150,0,0,0,0,0,0,1065353216,1065353216,2290978823,418,0,0,0,0,0,0,1065353216,2147483648,0,0,0,0,0,0,0,0,|1,2290978823,1,`).then(spawnData => {
                                                        try {
                                                            const Identifier = spawnData.data.Result[0].Identifier;
                                                            setTimeout(function() {
                                                                connection.send(`select get ${Identifier}`).then(finalPos => {
                                                                    const position = finalPos.data.Result.Position;
                                                                    const turabadaRock = new Prefab("Poison_Cloud")
                                                                    .addChildPrefab("Poison_Cloud_50236", new Prefab("Poison_Cloud")
                                                                    .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                    .setOnFire()
                                                                    )
                                                                    .addChildPrefab("Poison_Cloud_50236", new Prefab("Poison_Cloud")
                                                                    .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                    .setOnFire()
                                                                    )
                                                                    .addChildPrefab("Poison_Cloud_50236", new Prefab("Ash_Gotera_Smoke")
                                                                    .setPosition({x: position[0], y: position[1], z: position[2]})
                                                                    .setOnFire()
                                                                    )
                                                                    .setPosition({x: position[0], y: position[1], z: position[2]})

                                                                    for (var i = 0; i != 1; i++) {
                                                                        connection.send(`spawn string-raw ${turabadaRock.toSaveString()}`).then(spawnData2 => {
                                                                            setTimeout(function() {
                                                                                connection.send(`wacky destroy ${spawnData2.data.Result.Identifier}`);
                                                                            }, 7000);
                                                                        });
                                                                    }
                                                                    connection.send(`wacky destroy ${Identifier}`);
                                                                }).catch(error => {
                                                                });
                                                            }, 5000);
                                                        } catch {
                                                        }
                                                    });
                                                });
                                            }).catch(error => {
                                            });

                                            if (jsonContainsString(RightHand, "Guard Handle") && jsonContainsString(LeftHand, " ")) {
                                                connection.send(`wacky destroy ${LeftHand.Identifier}`);
                                            } else if (jsonContainsString(LeftHand, "Guard Handle") && jsonContainsString(RightHand, " ")) {
                                                connection.send(`select ${RightHand.Identifier}`);
                                                connection.send(`select tostring`).then(spawnData => {
                                                console.log(spawnData);
                                                    connection.send(`spawn string ${id} ${spawnData.data.ResultString}`);
                                                });
                                            }

                                            for (const spell of transformationSpells) {
                                                try {
                                                    const { spellName, spawnItem, holdingItem, stat, stat2, cmd } = spell;
                                                    if (jsonContainsString(RightHand, "Book") && isInSpellChamber && jsonContainsString(LeftHand, holdingItem)) {
                                                        try {
                                                            say(id, spellName, 2); 
                                                            connection.send(`wacky destroy ${LeftHand.Identifier}`);   
                                                            connection.send(`spawn ${id} ${spawnItem}`);
                                                            connection.send(`player modify-stat ${id} ${stat}`);
                                                            connection.send(`player set-stat ${id} ${stat2}`);
                                                            connection.send(cmd);
                                                        } catch {
                                                        }
                                                    }
                                                } catch {
                                                }
                                            }
                                        }).catch(error => {
                                        });
                                    }
                                }
                            } catch (error) {
                            }
                        }
                    }).catch(error => {
                    });
                }
            }, 2000);

        } catch {
        
        }

        connection.subscribe("ObjectKilled", message => {
            const { killerPlayer, name } = message.data;
            
            if (killerPlayer) {
                const drops = [
                    {cmd: `spawn string ${killerPlayer.id} 46340,48,46340,0,0,0,0,0,0,1065353216,1065353216,0,0,0,`, creature: "Wyrm", chance: 28},
                    {cmd: `spawn ${killerPlayer.id} SoftFabricLargeRoll mythril`, creature: "Crystal Wyrm", chance: 100},
                    {cmd: `spawn ${killerPlayer.id} SoftFabricMediumRoll mythril`, creature: "Crystal Wyrm", chance: 20},
                    {cmd: `spawn ${killerPlayer.id} puzzleorb1`, creature: "Crystal Wyrm", chance: 100},
                    {cmd: `spawn ${killerPlayer.id} SpriggullFeatherGreen`, creature: "Spriggull(", chance: 35},
                    {cmd: `spawn ${killerPlayer.id} SpriggullFeatherPurple`, creature: "Spriggull(", chance: 20},
                    {cmd: `spawn ${killerPlayer.id} GrassClump redwoodgoteracorematerial`, creature: "Gotera", chance: 5},
                ];

                for (const drop of drops) {
                    const { cmd, creature, chance} = drop;
                    const chanceMath = Math.floor(Math.random() * chance) === 1;

                    if (name.includes(creature) && chanceMath) {
                        connection.send(cmd);
                    }
                }
            }
        });

        connection.subscribe("PlayerMovedChunk", message => {
            const { newChunk, oldChunk, player } = message.data;

            if (newChunk.includes("Cave")) {
                const matches = newChunk.match(/\d+/g);
                if (matches) {
                    const updatedChunk = newChunk.replace(/\d+/g, match => parseInt(match) + 1);
                    say(player.id, `\n\n\n\n\n\n\n${updatedChunk}`, 2);
                }
            }
        });

        connection.subscribe("SocialTabletPlayerReported", message => {
            const { ReportedBy, ReportedPlayer, Reason } = message.data;
            
            if (Reason === "Griefing") {
                
                connection.send(`trade atm get ${ReportedBy.id}`).then(resp => {
                    const money = resp.data.Result;
                    if (money >= 40) {
                        connection.send(`trade atm add ${ReportedBy.id} -40`);
                        say(ReportedBy.id, `Teleported to ${ReportedPlayer.username}\n\n${money - 40} Coins left.`, 7);
                        connection.send(`player teleport ${ReportedBy.id} ${ReportedPlayer.id}`);
                    } else {
                        say(ReportedBy.id, "You must have at least 40 coins in your ATM to fast travel.", 10);
                    }
                });

                //Credit to Bargah for the teleport tablet idea!
            }
            console.log(Reason);
        });
    });


    bot.start();
} catch {

}
