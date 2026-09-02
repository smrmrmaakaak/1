using System;
using System.CodeDom.Compiler;
using StardewModdingAPI;

namespace SpaceCore
{
    [GeneratedCode("SMAPI", "4.0.0")]
    internal static class I18n
    {
        private static ITranslationHelper Translations;

        public static void Init(ITranslationHelper translations)
        {
            Translations = translations;
        }

        public static string GetByKey(string key, object tokens = null)
        {
            if (Translations == null) return key;
            return Translations.Get(key, tokens);
        }

        public static string Config_CustomSkillPage_Name() => GetByKey("config.custom-skill-page.name");
        public static string Config_CustomSkillPage_Tooltip() => GetByKey("config.custom-skill-page.tooltip");
        public static string Config_SupportAllProfessionsMod_Name() => GetByKey("config.support-all-professions-mod.name");
        public static string Config_SupportAllProfessionsMod_Tooltip() => GetByKey("config.support-all-professions-mod.tooltip");
        public static string Config_AdvancedSocialInteractions() => GetByKey("config.advanced-social-interactions");
        public static string Config_AlwaysTrigger_Name() => GetByKey("config.always-trigger.name");
        public static string Config_AlwaysTrigger_Description() => GetByKey("config.always-trigger.description");
        public static string Config_TriggerModifier_Name() => GetByKey("config.trigger-modifier.name");
        public static string Config_TriggerModifier_Description() => GetByKey("config.trigger-modifier.description");

        public static string InteractionWith(object tokens = null) => GetByKey("interaction-with", tokens);
        public static string InteractionWith(string npc) => GetByKey("interaction-with", new { npc });
        public static string Interaction_Chat() => GetByKey("interaction.chat");
        public static string Interaction_GiftHeld() => GetByKey("interaction.gift-held");
        public static string Interaction_Cancel() => GetByKey("interaction.cancel");

        public static string Question_Ask() => GetByKey("question.ask");
        public static string HealthRegen() => GetByKey("health-regen");
        public static string StaminaRegen() => GetByKey("stamina-regen");
        public static string ResourceClump_BadToolTier() => GetByKey("resource-clump.bad-tool-tier");
        public static string Guidebook_PreviousPage() => GetByKey("guidebook.previous-page");
        public static string Guidebook_NextPage() => GetByKey("guidebook.next-page");

        public static string Buff_CustomSkill(object tokens = null) => GetByKey("buff.custom-skill", tokens);
        public static string Buff_CustomSkill(string skill, int level) => GetByKey("buff.custom-skill", new { skill, level });
    }
}
