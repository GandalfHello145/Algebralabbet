"""Original visual explanations for Algebra lab, Matematik X sections 2.1–2.3.
All visible typography uses LaTeX. Render with Manim Community 0.22.1.
"""
from pathlib import Path
import json
from manim import *

config.frame_width=16
config.frame_height=9
BG='#101b2b'; INK='#f4f3ed'; MUTED='#a3b7c9'; MINT='#57dbb7'; GOLD='#e5b866'; BLUE='#83baff'; CORAL='#ed8b82'; VIOLET='#bfa5eb'
TEMPLATE=TexTemplate(preamble=r'\usepackage[T1]{fontenc}\usepackage[utf8]{inputenc}\usepackage[swedish]{babel}\usepackage{lmodern,amsmath,amssymb,mathtools,xcolor}')
ROOT=Path(__file__).resolve().parent.parent

def tx(s,size=30,color=INK,width=13):
    m=Tex(s,tex_template=TEMPLATE,font_size=size,color=color)
    if m.width>width:m.scale_to_fit_width(width)
    return m

def mt(s,size=52,color=INK,width=13):
    m=MathTex(s,tex_template=TEMPLATE,font_size=size,color=color)
    if m.width>width:m.scale_to_fit_width(width)
    return m

def tile(label,color=MINT,width=1.1,height=.8):
    return VGroup(RoundedRectangle(width=width,height=height,corner_radius=.12,fill_color=color,fill_opacity=.13,stroke_color=color,stroke_width=2),mt(label,34,color))

def dots(n,color=MINT):
    return VGroup(*[Dot(radius=.09,color=color) for _ in range(n)]).arrange_in_grid(rows=2 if n>=4 else 1,buff=.24)

class Lesson(Scene):
    title=''; slug=''; number=''
    def setup(self):
        self.camera.background_color=BG
        self.cues=[]; self.caption=None; self.contents=VGroup()
        self.header=VGroup(tx('ALGEBRALABBET',19,MUTED).move_to([-5.8,4.03,0]),tx(self.number+' / '+self.title,25,MINT).move_to([2.6,4.03,0]),Line([-7.3,3.65,0],[7.3,3.65,0],stroke_color=MUTED,stroke_width=1).set_opacity(.25))
        self.add(self.header)
    def cue(self,text):
        if self.cues:self.cues[-1]['end']=float(self.time)
        if self.caption:self.remove(self.caption)
        self.caption=tx(text,28,INK,width=13.8).move_to([0,-3.65,0])
        bg=Rectangle(width=16,height=1.1,fill_color=BG,fill_opacity=1,stroke_width=0).move_to([0,-3.9,0])
        self.add(bg,self.caption)
        self.cues.append({'start':float(self.time),'text':text})
    def heading(self,title):
        m=tx(title,35,GOLD).move_to([0,2.85,0]);self.play(FadeIn(m,shift=UP*.12),run_time=1);return m
    def clear(self,*objects):
        objs=objects or tuple(m for m in self.mobjects if m not in self.header.submobjects and m is not self.header and m is not self.caption and not(isinstance(m,Rectangle) and m.width==16))
        if objs:self.play(*[FadeOut(m) for m in objs],run_time=.8)
    def beat(self,seconds=8):self.wait(seconds)
    def finish(self):
        self.cues[-1]['end']=float(self.time)
        out=ROOT/'dist/assets/captions';out.mkdir(parents=True,exist_ok=True)
        def stamp(v):
            z=round(v*1000);return f'{z//3600000:02}:{z//60000%60:02}:{z//1000%60:02}.{z%1000:03}'
        import re
        plain=lambda s: re.sub(r'\\(?:textbf|emph)\{([^}]*)\}',r'\1',s).replace('\\,',' ').replace('$','').replace('\\cdot','·').replace('\\neq','≠').replace('\\times','×').replace('\\','')
        (out/(self.slug+'.vtt')).write_text('WEBVTT\n\n'+'\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{plain(c["text"])}' for i,c in enumerate(self.cues))+'\n')
        (out/(self.slug+'.json')).write_text(json.dumps({'title':self.title,'duration':float(self.time),'cues':self.cues,'resolution':[1920,1080],'fps':30,'narration':False},ensure_ascii=False,indent=2))

class Uttryck(Lesson):
    title='Algebraiska uttryck';slug='01-uttryck';number='2.1'
    def construct(self):
        self.cue('Hur beskriver vi något innan vi vet hur mycket det är?')
        h=self.heading('Ett tal som kan förändras')
        x=tile('x',MINT,1.5,1.4).move_to([-3,0,0]);q=mt('?',76,MINT).move_to([2.6,0,0]);arrow=Arrow([-1.7,0,0],[1.3,0,0],color=MUTED)
        self.play(FadeIn(x),GrowArrow(arrow),Write(q),run_time=2);self.beat(8)
        self.cue('Bokstaven $x$ får stå för antalet kulor i en påse.')
        bag=VGroup(RoundedRectangle(width=1.8,height=2.1,corner_radius=.25,color=MINT,fill_opacity=.12,fill_color=MINT),mt('x',64,MINT)).move_to([-3,0,0]);meaning=tx('$x$ = antal kulor i en påse',36).move_to([2,0,0])
        self.play(ReplacementTransform(x,bag),FadeOut(q),FadeOut(arrow),Write(meaning),run_time=2);self.beat(10)
        self.cue('Tre likadana påsar innehåller $x+x+x$ kulor.')
        self.clear(h,meaning);bags=VGroup(*[bag.copy() for _ in range(3)]).arrange(RIGHT,buff=.5).move_to([-.6,.7,0]);self.remove(bag)
        expr=mt('x+x+x',62,MINT).move_to([0,-1.7,0]);self.play(LaggedStart(*[FadeIn(b,shift=UP*.5) for b in bags],lag_ratio=.2),Write(expr),run_time=3);self.beat(9)
        self.cue('Vi skriver $3x$. Det betyder $3$ gånger $x$.')
        short=mt('3x',76,MINT).move_to(expr);mult=mt('3x=3\\cdot x',46).move_to([0,2.5,0]);self.play(TransformMatchingTex(expr,short),Write(mult),run_time=2);self.beat(10)
        self.cue('Två lösa kulor kommer till. Hela uttrycket är $3x+2$.')
        loose=dots(2,GOLD).scale(1.8).move_to([3.7,.7,0]);plus=mt('+',44).move_to([2.85,.7,0]);new=mt('3x+2',76).set_color_by_tex('x',MINT).move_to(short)
        self.play(FadeIn(loose,shift=DOWN*.5),Write(plus),TransformMatchingTex(short,new),run_time=2);self.beat(10)
        self.cue('Uttrycket visar ett samband. Det har olika värde för olika $x$.')
        self.play(Indicate(bags,color=MINT),Indicate(loose,color=GOLD),run_time=2);self.beat(9)
        self.cue('Om varje påse innehåller fyra kulor sätter vi in $x=4$.')
        four=mt('x=4',48,MINT).move_to([0,2.5,0]);self.play(ReplacementTransform(mult,four),run_time=1)
        ins=mt('3\\cdot4+2',72).move_to(new);self.play(TransformMatchingTex(new,ins),LaggedStart(*[ReplacementTransform(b,VGroup(RoundedRectangle(width=1.8,height=2.1,corner_radius=.25,color=MINT),dots(4).scale(1.8)).move_to(b)) for b in bags],lag_ratio=.15),run_time=3);self.beat(8)
        self.cue('Räkna multiplikationen först: $12+2=14$.')
        result=mt('12+2=14',72).move_to(ins);self.play(TransformMatchingTex(ins,result),run_time=2);self.beat(10)
        self.cue('Byt till $x=7$. Samma uttryck får nu värdet $23$.')
        self.clear(*[m for m in self.mobjects if m not in (self.header,self.caption) and not(isinstance(m,Rectangle) and m.width==16)])
        row=VGroup(mt('x=7',52,MINT),mt('3\\cdot7+2=23',68)).arrange(DOWN,buff=.8).move_to([0,.4,0]);self.play(Write(row),run_time=3);self.beat(10)
        self.cue('Jämför $3x+2$ med $3(x+2)$. Parentesen förändrar betydelsen.')
        self.clear(row);left=VGroup(mt('3x+2',60,MINT),tx('Tre påsar + två lösa',26)).arrange(DOWN,buff=.6).move_to([-3.6,.5,0]);right=VGroup(mt('3(x+2)',60,GOLD),tx('Tre grupper med $x+2$',26)).arrange(DOWN,buff=.6).move_to([3.6,.5,0]);self.play(FadeIn(left,shift=RIGHT*.3),FadeIn(right,shift=LEFT*.3),run_time=2);self.beat(10)
        self.cue('När $x=4$ blir värdena $14$ respektive $18$.')
        lv=mt('14',68,MINT).next_to(left,DOWN,buff=.7);rv=mt('18',68,GOLD).next_to(right,DOWN,buff=.7);self.play(Write(lv),Write(rv),run_time=2);self.beat(9)
        self.cue('Din tur: fyra påsar och tre lösa. Vilket uttryck beskriver det?')
        self.clear(left,right,lv,rv);prompt=tx('Fyra påsar. Tre lösa kulor.',39).move_to([0,1.7,0]);choices=VGroup(mt('4x+3',58,MINT),mt('4(x+3)',58,GOLD),mt('4+x+3',58,BLUE)).arrange(RIGHT,buff=1.2).move_to([0,-.3,0]);self.play(Write(prompt),FadeIn(choices),run_time=2);self.beat(12)
        self.cue('Svar: $4x+3$. Koefficienten $4$ talar om antalet påsar.')
        self.play(Circumscribe(choices[0],color=MINT),choices[1:].animate.set_opacity(.3),run_time=2);self.beat(10)
        self.cue('Prova också $x=5$. Då blir $4x+3=23$.')
        check=mt('4\\cdot5+3=23',56).move_to([0,-1.9,0]);self.play(Write(check),run_time=2);self.beat(10)
        self.cue('I labbet: ändra $x$, förutsäg värdet och förklara varje del.')
        self.clear(prompt,choices,check);end=VGroup(tx('En bokstav. Många möjliga värden.',39,MINT),mt('ax+b',84),tx('antal grupper $\\times$ värde + fast del',29,GOLD)).arrange(DOWN,buff=.65).move_to([0,.3,0]);self.play(FadeIn(end),run_time=2);self.beat(10)
        self.finish()

class Monster(Lesson):
    title='Mönster';slug='02-monster';number='2.2'
    def pattern(self,n,scale=1):
        fixed=VGroup(*[Dot(radius=.11,color=GOLD) for _ in range(2)]).arrange(DOWN,buff=.23)
        groups=VGroup(*[VGroup(*[Dot(radius=.11,color=MINT) for _ in range(3)]).arrange(DOWN,buff=.23) for _ in range(n)]).arrange(RIGHT,buff=.28)
        return VGroup(fixed,groups).arrange(RIGHT,buff=.45).scale(scale)
    def construct(self):
        self.cue('Ett mönster växer. Kan du se vad som förändras och vad som finns kvar?')
        h=self.heading('Två fasta prickar. Tre nya per steg.')
        p1=self.pattern(1,1.4).move_to([-4,.6,0]);p2=self.pattern(2,1.4).move_to([0,.6,0]);p3=self.pattern(3,1.4).move_to([4,.6,0]);labs=VGroup(*[tx('Figur '+str(i+1),28).move_to([pos,-1,0]) for i,pos in enumerate([-4,0,4])]);self.play(FadeIn(p1),Write(labs[0]),run_time=2);self.beat(6)
        self.cue('Figur ett innehåller fem prickar: två fasta och en grupp om tre.')
        count1=mt('2+3=5',42).next_to(labs[0],DOWN,buff=.45);self.play(Write(count1),Indicate(p1[0],color=GOLD),run_time=2);self.beat(9)
        self.cue('I figur två finns två grupper om tre. De två gula prickarna är kvar.')
        count2=mt('2+2\\cdot3=8',42).next_to(labs[1],DOWN,buff=.45);self.play(TransformFromCopy(p1,p2),Write(labs[1]),Write(count2),run_time=3);self.beat(9)
        self.cue('Figur tre har elva prickar. Vi lägger alltid till tre.')
        count3=mt('2+3\\cdot3=11',42).next_to(labs[2],DOWN,buff=.45);self.play(TransformFromCopy(p2,p3),Write(labs[2]),Write(count3),run_time=3);self.beat(9)
        self.cue('Följ ökningen: $5$, $8$, $11$. Vad tror du att nästa antal blir?')
        self.play(LaggedStart(*[Indicate(c,color=MINT) for c in [count1,count2,count3]],lag_ratio=.5),run_time=3);self.beat(10)
        self.cue('Figur fyra har $14$ prickar. Men hur hittar vi figur $20$ direkt?')
        self.clear(h,p1,p2,p3,labs,count1,count2,count3);p4=self.pattern(4,1.6).move_to([0,.7,0]);ans=mt('2+4\\cdot3=14',58).move_to([0,-1.5,0]);self.play(FadeIn(p4),Write(ans),run_time=2);self.beat(10)
        self.cue('Bokstaven $n$ får stå för figurens nummer.')
        nlab=mt('n=\\text{figurens nummer}',45,MINT).move_to([0,2.5,0]);self.play(Write(nlab),run_time=2);self.beat(9)
        self.cue('Antalet grupper är $n$. Varje grupp innehåller tre prickar.')
        brace=Brace(p4[1],DOWN,color=MINT);bl=mt('3n',50,MINT).next_to(brace,DOWN);self.play(GrowFromCenter(brace),Write(bl),FadeOut(ans),run_time=2);self.beat(10)
        self.cue('De två fasta prickarna ger $+2$. Hela regeln är $3n+2$.')
        fixedbrace=Brace(p4[0],LEFT,color=GOLD);fl=mt('2',45,GOLD).next_to(fixedbrace,LEFT);rule=mt('3n+2',70).move_to([0,-2.1,0]);self.play(GrowFromCenter(fixedbrace),Write(fl),Write(rule),run_time=2);self.beat(10)
        self.cue('Sätt in $n=20$. Vi får $3\\cdot20+2=62$.')
        self.clear(p4,brace,bl,fixedbrace,fl,nlab);sub=mt('3\\cdot20+2=62',68).move_to([0,.6,0]);self.play(TransformMatchingTex(rule,sub),run_time=3);self.beat(10)
        self.cue('Ökningen tre räcker inte som regel. Regeln $3n$ missar de fasta prickarna.')
        wrong=mt('3n\\quad\\neq\\quad3n+2',60).move_to([0,-1.2,0]);self.play(Write(wrong),run_time=2);self.beat(10)
        self.cue('Kontrollera alltid med en liten figur. För $n=1$ ger regeln fem prickar.')
        check=mt('3\\cdot1+2=5',55,MINT).move_to([0,2.2,0]);self.play(Write(check),run_time=2);self.beat(10)
        self.cue('Nu ett nytt mönster: fyra nya prickar per steg och en fast prick.')
        self.clear(sub,wrong,check);new=VGroup(*[VGroup(Dot(color=GOLD,radius=.11),* [Dot(color=MINT,radius=.11) for _ in range(4*i)]).arrange_in_grid(rows=2,buff=.22) for i in (1,2,3)]).arrange(RIGHT,buff=1.6).move_to([0,.5,0]);nums=VGroup(mt('5',40),mt('9',40),mt('13',40));[nums[i].next_to(new[i],DOWN,buff=.5) for i in range(3)];self.play(FadeIn(new),Write(nums),run_time=3);self.beat(9)
        self.cue('Din tur: vilken regel beskriver antalet prickar i figur $n$?')
        question=mt('\\text{antal}=\\;?',65).move_to([0,-1.9,0]);self.play(Write(question),run_time=1);self.beat(13)
        self.cue('Regeln är $4n+1$. Figur tio innehåller $41$ prickar.')
        solution=mt('4n+1\\qquad4\\cdot10+1=41',58,MINT).move_to(question);self.play(TransformMatchingTex(question,solution),run_time=2);self.beat(10)
        self.cue('I labbet: bygg ett eget mönster och beskriv det med bild, tabell och regel.')
        self.clear(new,nums,solution);summary=VGroup(tx('Se det som växer.',39,MINT),tx('Hitta det som är fast.',39,GOLD),mt('\\text{antal}=a n+b',64)).arrange(DOWN,buff=.6).move_to([0,.3,0]);self.play(FadeIn(summary),run_time=2);self.beat(10)
        self.finish()

class Forenkla(Lesson):
    title='Förenkling av uttryck';slug='03-forenkla';number='2.3'
    def construct(self):
        self.cue('Att förenkla är att skriva samma värde på ett tydligare sätt.')
        h=self.heading('Olika uttryck. Samma värde.')
        expression=mt('4x+3+2x-1',72).move_to([0,.5,0]);self.play(Write(expression),run_time=3);self.beat(9)
        self.cue('Här finns två sorters termer: $x$-termer och vanliga tal.')
        self.play(expression.animate.set_color(MINT),run_time=1);terms=VGroup(tile('4x',MINT,1.6),tile('+3',GOLD,1.6),tile('+2x',MINT,1.6),tile('-1',GOLD,1.6)).arrange(RIGHT,buff=.5).move_to([0,-1.2,0]);self.play(LaggedStart(*[FadeIn(t,shift=DOWN*.3) for t in terms],lag_ratio=.15),run_time=2);self.beat(9)
        self.cue('Liknande termer hör ihop. Flytta hela termen, inklusive tecknet.')
        self.play(terms[0].animate.move_to([-3,.1,0]),terms[2].animate.move_to([-1,.1,0]),terms[1].animate.move_to([2,.1,0]),terms[3].animate.move_to([4,.1,0]),FadeOut(expression),FadeOut(h),run_time=3);self.beat(9)
        self.cue('Fyra $x$ och två $x$ blir sex $x$.')
        xsum=mt('4x+2x=6x',62,MINT).move_to([-2,-1.5,0]);self.play(Write(xsum),Indicate(VGroup(terms[0],terms[2]),color=MINT),run_time=3);self.beat(9)
        self.cue('Tre minus ett är två. Därför blir taldelen $+2$.')
        nsum=mt('3-1=2',56,GOLD).move_to([3,-1.5,0]);self.play(Write(nsum),Indicate(VGroup(terms[1],terms[3]),color=GOLD),run_time=2);self.beat(10)
        self.cue('Det förenklade uttrycket är $6x+2$. Värdet har inte ändrats.')
        final=mt('6x+2',80).move_to([0,2,0]);self.play(Write(final),run_time=2);self.beat(10)
        self.cue('Kontrollera med $x=3$. Båda uttrycken får värdet tjugo.')
        self.clear(terms,xsum,nsum);check=VGroup(mt('4\\cdot3+3+2\\cdot3-1=20',52),mt('6\\cdot3+2=20',52,MINT)).arrange(DOWN,buff=.8).move_to([0,-.3,0]);self.play(Write(check),run_time=3);self.beat(10)
        self.cue('Men ett $x$ och tre vanliga ettor är olika sorter.')
        self.clear(final,check);mixed=VGroup(tile('x',MINT,1.5,1.3),tile('1',GOLD),tile('1',GOLD),tile('1',GOLD)).arrange(RIGHT,buff=.35).move_to([0,.8,0]);label=mt('x+3',70).move_to([0,-1.3,0]);self.play(FadeIn(mixed),Write(label),run_time=2);self.beat(10)
        self.cue('$x+3$ kan inte bli $4x$. Prova $x=2$: fem är inte åtta.')
        no=mt('x+3\\neq4x',58,CORAL).move_to([0,2.5,0]);numbers=mt('2+3=5\\qquad4\\cdot2=8',48).move_to([0,-2.4,0]);self.play(Write(no),Write(numbers),run_time=2);self.beat(10)
        self.cue('Minustecknet följer termen: $5x-2x$ betyder fem $x$ minus två $x$.')
        self.clear(mixed,label,no,numbers);positive=VGroup(*[tile('x',MINT) for _ in range(5)]).arrange(RIGHT,buff=.2).move_to([0,.8,0]);neg=VGroup(*[tile('-x',CORAL) for _ in range(2)]).arrange(RIGHT,buff=.2).move_to([0,-.8,0]);self.play(FadeIn(positive),FadeIn(neg),run_time=2);self.beat(10)
        self.cue('Ett positivt och ett negativt $x$ bildar ett nollpar.')
        self.play(neg[0].animate.move_to(positive[3]),neg[1].animate.move_to(positive[4]),run_time=2);self.play(FadeOut(neg),FadeOut(positive[3:]),run_time=1);self.beat(9)
        self.cue('Tre positiva $x$ är kvar: $5x-2x=3x$.')
        remain=mt('5x-2x=3x',68,MINT).move_to([0,-1.3,0]);self.play(Write(remain),positive[:3].animate.move_to([0,.8,0]),run_time=2);self.beat(10)
        self.cue('Flera bokstäver? Håll $x$, $y$ och tal i varsin grupp.')
        self.clear(positive[:3],remain);multi=mt('3x+2y+x-y+4',64).move_to([0,1,0]);grouped=mt('(3x+x)+(2y-y)+4',60).move_to([0,-.7,0]);self.play(Write(multi),run_time=2);self.play(TransformFromCopy(multi,grouped),run_time=2);self.beat(9)
        self.cue('Resultatet är $4x+y+4$. Olika sorters termer slås inte ihop.')
        simplified=mt('4x+y+4',70,MINT).move_to([0,-2,0]);self.play(Write(simplified),run_time=2);self.beat(9)
        self.cue('Din tur: förenkla $7x+5-3x-2$. Tänk en sort i taget.')
        self.clear(multi,grouped,simplified);challenge=mt('7x+5-3x-2',74).move_to([0,.6,0]);self.play(Write(challenge),run_time=2);self.beat(13)
        self.cue('Svar: $4x+3$. Kontrollera själv genom att välja ett värde på $x$.')
        sol=mt('4x+3',82,MINT).move_to([0,-1.4,0]);self.play(Write(sol),run_time=2);self.beat(10)
        self.cue('I labbet: sortera termer, skapa nollpar och försök förklara varje steg.')
        self.clear(challenge,sol);summary=VGroup(tx('Samla samma sort.',39,MINT),tx('Behåll termens tecken.',39,GOLD),tx('Kontrollera med ett värde.',39,BLUE)).arrange(DOWN,buff=.65).move_to([0,.3,0]);self.play(FadeIn(summary),run_time=2);self.beat(9)
        self.finish()
