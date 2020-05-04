var universalModifier = (attribute) => {
    var modifier = 0;
    if (attribute == 3) {
        modifier = -3;
    }
    else if (attribute >= 4 && attribute <= 5) {
        modifier = -2;
    }
    else if (attribute >= 6 && attribute <= 8) {
        modifier = -1;
    }
    else if (attribute >= 13 && attribute <= 15) {
        modifier = 1;
    }
    else if (attribute >= 16 && attribute <= 17) {
        modifier = 2;
    }
    else if (attribute == 18) {
        modifier = 3;
    }
    return modifier;
}

var getAttribute = (value) => {
    var attribute = parseInt(value) || 0;
    return Math.min(18, Math.max(3, attribute));
}

on("change:STR", (eventinfo) => {
    var attribute = getAttribute(eventinfo.newValue)
    var modifier = universalModifier(attribute);
    setAttrs({
        STR: attribute,
        strmod: modifier
    });
});

on("change:DEX", (eventinfo) => {
    var attribute = getAttribute(eventinfo.newValue)
    var modifier = universalModifier(attribute);
    setAttrs({
        DEX: attribute,
        dexmod: modifier
    });
});

on("change:CON", (eventinfo) => {
    var attribute = getAttribute(eventinfo.newValue)
    var modifier = universalModifier(attribute);
    setAttrs({
        CON: attribute,
        conmod: modifier
    });
});

on("change:INT", (eventinfo) => {
    var attribute = getAttribute(eventinfo.newValue)
    var modifier = universalModifier(attribute);
    setAttrs({
        INT: attribute,
        intmod: modifier,
    });
});

on("change:WIS", (eventinfo) =>{
    var attribute = getAttribute(eventinfo.newValue)
    var modifier = universalModifier(attribute);
    var xpbonus = 0;
    if (attribute >= 13) {
        xpbonus = 5;
    }
    setAttrs({
        WIS: attribute,
        wismod: modifier,
        wisxp: xpbonus
    });
});

on("change:CHA", (eventinfo) => {
    var attribute = getAttribute(eventinfo.newValue)
    var modifier = universalModifier(attribute);
    var xpbonus = 0;
    if (attribute >= 13) {
        xpbonus = 5;
    }
    setAttrs({
        CHA: attribute,
        chamod: modifier,
        chaxp: xpbonus
    });
});

on("change:WIS change:CHA change:INT change:STR change:DEX change:CON change:PRI", () => {
    getAttrs(["wisxp","chaxp","PRI"], (values) => {
        var primaryAttr = values.PRI;
        getAttrs([primaryAttr], (val) => {
            var prime = val[primaryAttr];
            var bonus = 0;
            bonus += parseInt(values.wisxp) || 0;
            bonus += parseInt(values.chaxp) || 0;
            if (prime >= 13) {
                bonus += 5;
                if (prime >= 15) {
                    bonus += 5;
                }
            }
            setAttrs({
                bonusxppct: bonus,
            });
        });
    });
});

on("change:typeac", () => {
    getAttrs(["typeac"], (values) => {
        var typeac = parseInt(values.typeac) || 0;
        var baseac = 0;
        if(typeac == 0) {
            baseac = 12;
        } else {
            baseac = 7;
        }
        setAttrs({
            baseac: baseac,
        });
    });
});

on("change:dexmod change:baseac change:armorac change:shieldac change:otherac", () => {
    getAttrs(["dexmod","typeac","baseac","armorac","shieldac","otherac"], (values) => {
        var dexmod = parseInt(values.dexmod) || 0;
        var typeac = parseInt(values.typeac) || 0;
        var baseac = parseInt(values.baseac) || 0;
        var armorac = parseInt(values.armorac) || 0;
        var shieldac = parseInt(values.shieldac) || 0;
        var otherac = parseInt(values.otherac) || 0;
        var totalac = 0;
        if (typeac == 0 ) {
            totalac = baseac + dexmod + armorac + shieldac + otherac;
        } else {
            totalac = baseac - dexmod - armorac - shieldac - otherac;
        }
        setAttrs({
            AC: totalac
        });
    });
});

on("sheet:opened", () => {
    getAttrs(["sheetversion"], (values) => {
        var vers = parseFloat(values.sheetversion) || 0;
        if (vers < 1.0) {
            getAttrs(["maxhp","gearwt"], (values) => {
                var oldhp = parseInt(values.maxhp) || 0;
                var oldwt = parseFloat(values.gearwt) || 0.0;
                setAttrs({
                    hp_max: oldhp,
                    gearweight: oldwt,
                    sheetversion: 1.0
                });
            });
        }
    });
});

on("change:repeating_weapon:wpnwt change:repeating_weapon remove:repeating_weapon", () => {
    getSectionIDs("repeating_weapon", (ids) => {
        var totalWeight = 0.0;
        ids.forEach((id, index, arr) => {
            var wtString = "repeating_weapon_" + id + "_wpnwt";
            var end = parseInt(arr.length) || 0;
            getAttrs([wtString], (val) => {
                var wt = parseFloat(val[wtString]) || 0.0;
                totalWeight += wt;
                if ( (index + 1) == end ){
                    setAttrs({
                        weaponwt: totalWeight
                    });
                }
            });
        });
        setAttrs({
            weaponwt: totalWeight
        });
    });
});

on("change:repeating_weapon:wpnismissile change:dexmod change:strmod", () => {
    getSectionIDs("repeating_weapon", (ids) => {
        ids.forEach((id) => {
            var isMissileKey = "repeating_weapon_" + id + "_wpnismissile";
            var toHitModKey = "repeating_weapon_" + id + "_wpntohitmod";
            var dmgModKey = "repeating_weapon_" + id + "_wpndmgmod";
            getAttrs([isMissileKey,"dexmod","strmod"], (vals) => {
                var isMissile = parseInt(vals[isMissileKey]) || 0;
                var toHitMod = 0;
                var dmgMod = 0;
                if (isMissile == 1) {
                    toHitMod = parseInt(vals.dexmod) || 0;
                } else {
                    toHitMod = parseInt(vals.strmod) || 0;
                    dmgMod = toHitMod;
                }
                setAttrs({
                    [`${toHitModKey}`] : toHitMod,
                    [`${dmgModKey}`] : dmgMod
                });
            });
        });
    });
});

on("change:repeating_gear change:repeating_gear:gearqty change:repeating_gear:gearwt remove:repeating_gear", () => {
    getSectionIDs("repeating_gear", (ids) => {
        var totalWeight = 0.0;
        ids.forEach((id,index,arr) => {
            var qtyString = "repeating_gear_" + id + "_gearqty";
            var wtString = "repeating_gear_" + id + "_gearwt";
            var end = parseInt(arr.length) || 0;
            getAttrs([qtyString, wtString], (val) => {
                var qty = parseFloat(val[qtyString]) || 0.0;
                var wt = parseFloat(val[wtString]) || 0.0;
                totalWeight += qty * wt;
                if ( (index+1) == end ){
                    setAttrs({
                        gearweight: totalWeight
                    });
                }
            });
        });
        setAttrs({
            gearweight: totalWeight
        });
    });
});

on("change:gearweight change:weaponwt", () => {
    getAttrs(["gearweight","weaponwt"], (val) => {
        var tot = (parseFloat(val.gearweight) || 0.0) + (parseFloat(val.weaponwt) || 0.0);
        setAttrs({
            totalweight: tot
        });
    });
});

on("change:totalweight sheet:opened", () => {
    getAttrs(["totalweight"], (val) => {
        var weight = (parseInt(val.totalweight) || 0);
        var pc_bonus = 3;
        var moves = 12;
        if (weight > 25 && weight <= 100) {
            moves = 9;
        } else if (weight > 100 && weight <= 150) {
            moves = 6;
        } else if (weight > 150 && weight <= 250) {
            moves = 3;
        } else if (weight > 250) {
            moves = 1;
        }
        moves = Math.min(12, (moves + pc_bonus));
        setAttrs({
            movesquares: moves
        });
    });
});