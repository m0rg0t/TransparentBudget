using System;
using System.Reflection;
class Program {
 static int count;
 static void Check(bool value,string name) { if(!value) throw new Exception(name); count++; }
 static object Call(object target,string name,params object[] args) { return target.GetType().GetMethod(name,BindingFlags.Instance|BindingFlags.NonPublic).Invoke(target,args); }
 static void Main() { Test(); Console.WriteLine("PASS " + count + " source assertions"); }
 static void Test() { var p=new TransparentBudgetWP8.Models.PlaceItem(); p.Description=null; Check(p.Description=="","null description renders empty"); Check(p.ShortDescription=="","null preview renders empty"); Check(p.Changed.Count==2,"both binding notifications");
 p.Description="<b>Hello</b>"; Check(p.Description=="Hello","HTML removed");Check(p.ShortDescription=="Hello","short text unchanged");
 p.Description=new string('x',255);Check(p.ShortDescription==p.Description,"exact limit is not truncated");p.Description=new string('x',256);Check(p.ShortDescription==new string('x',255)+"...","long preview ellipsis");
 p.Description="";Check(p.ShortDescription=="","empty accepted");
 } }