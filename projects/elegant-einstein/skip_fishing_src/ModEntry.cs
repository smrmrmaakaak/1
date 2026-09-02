using System;
using HarmonyLib;
using StardewModdingAPI;
using StardewValley.Menus;

namespace SkipFishingMinigame
{
    public class ModEntry : Mod
    {
        public override void Entry(IModHelper helper)
        {
            var harmony = new Harmony(this.ModManifest.UniqueID);
            harmony.Patch(
                original: AccessTools.Method(typeof(BobberBar), nameof(BobberBar.update)),
                postfix: new HarmonyMethod(typeof(ModEntry), nameof(BobberBar_Update_Postfix))
            );
            this.Monitor.Log("Skip Fishing Minigame loaded successfully!", LogLevel.Info);
        }

        public static void BobberBar_Update_Postfix(ref float ___distanceFromCatching)
        {
            ___distanceFromCatching = 1f;
        }
    }
}
