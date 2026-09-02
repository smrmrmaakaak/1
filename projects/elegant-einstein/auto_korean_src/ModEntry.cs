using System;
using StardewModdingAPI;
using StardewModdingAPI.Events;
using StardewValley;

namespace AutoKoreanDefault
{
    public class ModEntry : Mod
    {
        public override void Entry(IModHelper helper)
        {
            helper.Events.GameLoop.GameLaunched += this.OnGameLaunched;
            helper.Events.GameLoop.SaveLoaded += this.OnSaveLoaded;
            this.ApplyKorean();
        }

        private void OnGameLaunched(object sender, GameLaunchedEventArgs e)
        {
            this.ApplyKorean();
        }

        private void OnSaveLoaded(object sender, SaveLoadedEventArgs e)
        {
            this.ApplyKorean();
        }

        private void ApplyKorean()
        {
            try
            {
                if (LocalizedContentManager.CurrentLanguageCode != LocalizedContentManager.LanguageCode.ko)
                {
                    this.Monitor.Log("Setting game language to Korean (ko)...", LogLevel.Info);
                    LocalizedContentManager.CurrentLanguageCode = LocalizedContentManager.LanguageCode.ko;
                    this.Monitor.Log("Game language set to Korean successfully!", LogLevel.Info);
                }
            }
            catch (Exception ex)
            {
                this.Monitor.Log($"Error applying Korean language: {ex.Message}", LogLevel.Warn);
            }
        }
    }
}
