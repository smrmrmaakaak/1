using System;
using System.IO;
using System.Linq;
using Mono.Cecil;
using Mono.Cecil.Cil;

class Program
{
    static void Main(string[] args)
    {
        string dllPath = args.Length > 0 ? args[0] : "StardewValleyExpanded.dll";
        Console.WriteLine($"Patching {dllPath}...");

        var readerParams = new ReaderParameters { ReadWrite = true };
        using (var assembly = AssemblyDefinition.ReadAssembly(dllPath, readerParams))
        {
            var type = assembly.MainModule.Types.FirstOrDefault(t => t.Name == "HarmonyPatch_TMXLLoadMapFacingDirection" || t.FullName.Contains("TMXLLoadMapFacingDirection"));
            if (type != null)
            {
                Console.WriteLine($"Found type: {type.FullName}");
                var method = type.Methods.FirstOrDefault(m => m.Name == "ApplyPatch");
                if (method != null)
                {
                    Console.WriteLine($"Replacing {method.FullName} body with empty ret...");
                    method.Body.Instructions.Clear();
                    method.Body.Instructions.Add(Instruction.Create(OpCodes.Ret));
                }
            }
            else
            {
                Console.WriteLine("Type not found directly, searching all types...");
                foreach (var t in assembly.MainModule.Types)
                {
                    if (t.Name.Contains("TMXL"))
                    {
                        Console.WriteLine($"Found related type: {t.FullName}");
                        foreach (var m in t.Methods)
                        {
                            if (m.Name == "ApplyPatch")
                            {
                                Console.WriteLine($"Making {m.FullName} a no-op...");
                                m.Body.Instructions.Clear();
                                m.Body.Instructions.Add(Instruction.Create(OpCodes.Ret));
                            }
                        }
                    }
                }
            }

            assembly.Write();
            Console.WriteLine("SUCCESS: StardewValleyExpanded.dll patched cleanly!");
        }
    }
}
