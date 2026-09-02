using System;
using System.IO;
using Mono.Cecil;
using Mono.Cecil.Cil;

class Program
{
    static void Main()
    {
        var asmPath = Path.Combine("..", "xalz_dlls", "SMAPIGameLoader.dll");
        if (!File.Exists(asmPath))
        {
            Console.WriteLine("File not found: " + asmPath);
            return;
        }

        var asm = AssemblyDefinition.ReadAssembly(asmPath);
        foreach (var type in asm.MainModule.Types)
        {
            Console.WriteLine("Type: " + type.FullName);
            foreach (var m in type.Methods)
            {
                Console.WriteLine("  Method: " + m.Name);
                if (m.HasBody)
                {
                    foreach (var inst in m.Body.Instructions)
                    {
                        if (inst.Operand is string)
                            Console.WriteLine("    string: \"" + (string)inst.Operand + "\"");
                        else if (inst.OpCode == OpCodes.Call || inst.OpCode == OpCodes.Callvirt)
                            Console.WriteLine("    call: " + inst.Operand);
                    }
                }
            }
        }
    }
}
