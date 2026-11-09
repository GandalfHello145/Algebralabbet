"""Original Manim lessons: equations, modelling and unknowns on both sides.
All on-screen typography is TeX. Each 15-second beat has a caption and semantic animation.
"""
from pathlib import Path
import json
import numpy as np
from manim import *

config.frame_width=16
config.frame_height=9
BG='#101b2b'; INK='#f5f2e9'; MUTED='#a0adbc'; MINT='#57dbb7'; GOLD='#e5b866'; CORAL='#f18e87'; BLUE='#81b6ee'
TEMPLATE=TexTemplate(preamble=r'''\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage[swedish]{babel}
\usepackage{lmodern,amsmath,amssymb,mathtools,xcolor}''')
ROOT=Path(__file__).resolve().parent.parent

def text(s,size=30,color=INK,width=13):
    o=Tex(s,tex_template=TEMPLATE,font_size=size,color=color)
    if o.width>width:o.scale_to_fit_width(width)
    return o

def math(s,size=60,color=INK,width=13):
    o=MathTex(s,tex_template=TEMPLATE,font_size=size,color=color)
    if o.width>width:o.scale_to_fit_width(width)
    return o

def equation(s,size=60):
    o=math(s,size)
    o.set_color_by_tex('x',MINT)
    return o

def tile(value='x',color=MINT,side=.52):
    box=RoundedRectangle(width=side,height=side,corner_radius=.10,stroke_color=color,stroke_width=2,fill_color=color,fill_opacity=.13)
    return VGroup(box,math(value,24,color,width=side*.7)).set_z_index(2)

def group(n,symbol='1',color=GOLD,cols=5):
    if n<=0:return VGroup()
    return VGroup(*[tile(symbol,color) for _ in range(n)]).arrange_in_grid(cols=min(n,cols),buff=.13)

def balance(nx=3,nu=4,right=19):
    left=VGroup(group(nx,'x',MINT,3),group(nu,'1',GOLD,4)).arrange(DOWN,buff=.20).move_to([-3.4,-.3,0])
    rhs=group(right,'1',GOLD,5).move_to([3.4,-.3,0])
    base=VGroup(Line([-5.7,-1.9,0],[-1.1,-1.9,0],color=MUTED),Line([1.1,-1.9,0],[5.7,-1.9,0],color=MUTED),math('=',46,MUTED).move_to([0,-.3,0]))
    return VGroup(left,rhs,base)

def parallel_ops(label):
    return VGroup(*[VGroup(RoundedRectangle(width=3.2,height=.64,corner_radius=.17,stroke_color=GOLD,fill_color=GOLD,fill_opacity=.08),math(label,34,GOLD)).move_to([x,-2.45,0]) for x in [-3.5,3.5]])

def rings():
    return VGroup(*[Circle(radius=r,stroke_color=MINT,stroke_width=.6,stroke_opacity=.12).move_to([5,0,0]) for r in [1.5,2.3,3.1]])

class AlgebraFilm(Scene):
    number=4; title='Ekvationer'; slug='04-ekvationer'
    def setup(self):
        self.camera.background_color=BG
        self._cues=[];self._last_caption=None;self._visual=None;self._formula=None;self._step=None
        self.header=VGroup(text('ALGEBRALABBET',17,MUTED).move_to([-5.7,4.07,0]),text(f'2.{self.number} / '+self.title,25,INK,width=10).move_to([1.5,4.07,0]),Line([-7.1,3.65,0],[7.1,3.65,0],stroke_color=MUTED,stroke_opacity=.28))
        self.add(self.header)
        self.progress=VGroup(*[Dot(radius=.035,color=MUTED).move_to([-1.3+i*.24,-4.1,0]) for i in range(12)])
        self.add(self.progress)
        self.wait(1)
    def beat(self,index,heading,formula,caption,visual=None,operation=None,formula_chain=None):
        start=self.time
        step=text(f'{index:02d} / '+heading,30,INK,width=13).move_to([0,3.03,0])
        f=equation(formula,54).move_to([0,2.0,0])
        cap=text(caption,27,INK,width=13.4).move_to([0,-3.45,0])
        animations=[]
        for old,new in [(self._step,step),(self._formula,f),(self._last_caption,cap)]:
            animations.append(FadeIn(new,shift=UP*.1) if old is None else ReplacementTransform(old,new))
        if self._visual is not None:animations.append(FadeOut(self._visual,shift=DOWN*.08))
        if visual is not None:animations.append(FadeIn(visual,shift=UP*.15))
        animations.append(self.progress[index-1].animate.set_color(MINT).scale(1.8))
        self.play(*animations,run_time=1.2)
        self._step=step;self._formula=f;self._last_caption=cap;self._visual=visual
        if visual is not None:
            self.play(LaggedStart(*[Indicate(v,color=MINT,scale_factor=1.025) for v in visual[:min(3,len(visual))]],lag_ratio=.2),run_time=1.5)
        self.wait(2)
        if operation is not None:
            ops=parallel_ops(operation);self.play(LaggedStart(*[GrowFromCenter(v) for v in ops],lag_ratio=0),run_time=1)
            self.wait(3)
            self.play(*[FadeOut(o,shift=UP*.28) for o in ops],run_time=.8)
        if formula_chain:
            for target in formula_chain:
                new=equation(target,54).move_to([0,2,0])
                self.play(TransformMatchingTex(self._formula,new),run_time=1.6)
                self._formula=new
                self.wait(1.5)
        elapsed=self.time-start
        if elapsed<15:self.wait(15-elapsed)
        self._cues.append({'start':start,'end':self.time,'text':heading+'. '+caption.replace('\\',''),'formula':formula})
    def finish(self):
        self.wait(2)
        out=ROOT/'dist/assets/captions';out.mkdir(parents=True,exist_ok=True)
        def stamp(v):
            ms=round(v*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
            return f'{h:02}:{m:02}:{s:02}.{ms:03}'
        (out/f'{self.slug}.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f'{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for c in self._cues)+'\n')
        (out/f'{self.slug}.json').write_text(json.dumps({'title':self.title,'duration':self.time,'beats':self._cues,'narration':False,'text_renderer':'LaTeX'},ensure_ascii=False,indent=2))

class Ekvationer(AlgebraFilm):
    number=4;title='Ekvationer';slug='04-ekvationer'
    def construct(self):
        self.beat(1,'Samma värde på båda sidor','3x+4=19','Likhetstecknet säger att de två leden har samma värde.',balance())
        self.beat(2,'Vad döljer sig i en låda?','x+x+x+4=19','Alla lådor märkta med x har samma okända innehåll.',balance())
        wrong=VGroup(math(r'3\cdot3+4=13',47,CORAL).move_to([-3.5,-.2,0]),math(r'13\ne19',55,CORAL).move_to([3.5,-.2,0]),text('För litet',28,CORAL).move_to([0,-1.5,0]))
        self.beat(3,'En gissning går att kontrollera',r'x=3\quad ?','Om x är 3 blir vänsterledet 13. Då gäller inte likheten.',wrong)
        self.beat(4,'Gör samma sak i båda leden','3x+4-4=19-4','Ta bort fyra enheter från vardera sidan. Likheten bevaras.',balance(),operation='-4')
        self.beat(5,'Det som återstår','3x=15','Tre likadana lådor har tillsammans värdet femton.',balance(3,0,15))
        split=VGroup(*[VGroup(tile('x'),math('=',30,MUTED),group(5,'1',GOLD,5)).arrange(RIGHT,buff=.3).move_to([0,1-i*1.08,0]) for i in range(3)])
        self.beat(6,'Dela i tre lika grupper',r'\frac{3x}{3}=\frac{15}{3}','Dela båda leden med tre. Varje låda får fem enheter.',split,operation=r'\div3',formula_chain=['x=5'])
        self.beat(7,'Lösningen är ett värde','x=5','Lösningen är det värde på x som gör ursprungsekvationen sann.',VGroup(tile('x',MINT,1.1),math('=',55),tile('5',GOLD,1.1)).arrange(RIGHT,buff=.6))
        check=VGroup(math(r'3\cdot5+4=19',57).move_to([0,.3,0]),math('19=19',58,MINT).move_to([0,-1.2,0]))
        self.beat(8,'Sätt tillbaka värdet','3x+4=19','Kontrollera i ekvationen du började med: tre gånger fem plus fyra är nitton.',check)
        mistake=VGroup(math('3x+4=19',46).move_to([-3.6,.6,0]),math(r'3x=19',46,CORAL).move_to([3.6,.6,0]),text('Bara vänsterledet ändrades',26,CORAL).move_to([0,-.8,0]),Line([-1.5,-1.5,0],[1.5,-1.5,0],color=CORAL))
        self.beat(9,'Upptäck ett fel',r'3x+4=19\quad\not\Rightarrow\quad3x=19','Tar du bort fyra på bara en sida har du ändrat likheten.',mistake)
        inverse=VGroup(math(r'+2\ \longleftrightarrow\ -2',43,GOLD).move_to([0,.2,0]),math(r'\div4\ \longleftrightarrow\ \times4',43,MINT).move_to([0,-1.1,0]))
        self.beat(10,'Motsatta operationer',r'\frac{x}{4}+2=5','Ta först bort två. Multiplicera sedan båda leden med fyra.',inverse,formula_chain=[r'\frac{x}{4}=3','x=12'])
        question=VGroup(math('2x+3=17',58).move_to([0,.3,0]),text('Pausa och välj ditt första steg.',29,GOLD).move_to([0,-1.2,0]))
        self.beat(11,'Nu är det din tur','2x+3=17','Vilken operation gör du först? Lös och kontrollera innan du fortsätter.',question)
        answer=VGroup(math('2x=14',52).move_to([-3.5,.1,0]),math('x=7',60,MINT).move_to([3.5,.1,0]),math(r'2\cdot7+3=17',47).move_to([0,-1.4,0]))
        self.beat(12,'Se varför svaret fungerar','2x+3=17','Subtrahera tre, dela med två och kontrollera x lika med sju.',answer)
        self.finish()

class Problem(AlgebraFilm):
    number=5;title='Problemlösning';slug='05-problem'
    def construct(self):
        ticket=VGroup(RoundedRectangle(width=5.2,height=2,corner_radius=.2,stroke_color=MINT,fill_color=MINT,fill_opacity=.08),text('ENTRÉ 35 kr',38).move_to([0,.4,0]),text('En åktur 15 kr',29,GOLD).move_to([0,-.5,0]))
        self.beat(1,'Från berättelse till matematik','35+15x=125','Ett nöjesfält tar 35 kronor i entré och 15 kronor per åktur. Du betalar 125 kronor.',ticket)
        self.beat(2,'Välj vad bokstaven betyder',r'x=\text{antal åkturer}','x räknar åkturer. Det är inte ett pris och inte antalet kronor.',VGroup(tile('x',MINT,1.2),text('åkturer',40,MINT)).arrange(RIGHT,buff=.6))
        costs=VGroup(*[VGroup(tile(str(n),'#e5b866',.7),math(rf'35+15\cdot{n}={35+15*n}',38)).arrange(RIGHT,buff=.5).move_to([0,1-i*1.1,0]) for i,n in enumerate([1,2,3])])
        self.beat(3,'Hitta det fasta och det rörliga',r'\text{kostnad}=35+15x','Entrén betalas en gång. Varje åktur lägger till femton kronor.',costs)
        segments=VGroup(RoundedRectangle(width=2.3,height=.9,corner_radius=.1,stroke_color=GOLD,fill_color=GOLD,fill_opacity=.18),* [RoundedRectangle(width=.9,height=.9,corner_radius=.1,stroke_color=MINT,fill_color=MINT,fill_opacity=.14) for _ in range(6)]).arrange(RIGHT,buff=.1).move_to([0,-.2,0])
        self.beat(4,'Bygg en modell','35+15x=125','Det fasta priset och priset för x åkturer ska tillsammans bli 125 kronor.',VGroup(segments,text('fast del',24,GOLD).move_to([-3.2,-1.4,0]),text('lika stora delar',24,MINT).move_to([1.5,-1.4,0])))
        self.beat(5,'Ta bort den fasta kostnaden','35+15x-35=125-35','Subtrahera 35 från båda leden. Då återstår pengarna för åkturerna.',VGroup(math('125',75,GOLD),math('-35',48,MUTED).move_to([0,-1.3,0])),operation='-35',formula_chain=['15x=90'])
        groups=VGroup(*[VGroup(tile('15',MINT,.65),text('kr',20,MUTED)).arrange(DOWN,buff=.12) for _ in range(6)]).arrange(RIGHT,buff=.3).move_to([0,-.2,0])
        self.beat(6,'Hur många femton får plats i nittio?',r'\frac{15x}{15}=\frac{90}{15}','Dela båda leden med femton. Nittio kronor räcker till sex åkturer.',groups,operation=r'\div15',formula_chain=['x=6'])
        self.beat(7,'Svara i berättelsens språk',r'x=6\ \text{åkturer}','Du kan åka sex gånger. Skriv både antalet och vad antalet betyder.',VGroup(tile('6',MINT,1.5),text('åkturer',40)).arrange(RIGHT,buff=.5))
        self.beat(8,'Kontrollera hela kostnaden',r'35+15\cdot6=125','Entrén är 35 kronor och sex åkturer kostar 90 kronor. Summan blir 125.',VGroup(math('35',66,GOLD),math('+',52),math('90',66,MINT),math('=125',60)).arrange(RIGHT,buff=.4))
        self.beat(9,'En viktig skillnad',r'35+15x\ne15(35+x)','Entrén räknas bara en gång. Multiplicera inte den fasta kostnaden med antalet åkturer.',VGroup(math('35+15x',60,MINT).move_to([0,.4,0]),math('15(35+x)=525+15x',43,CORAL).move_to([0,-1,0])))
        self.beat(10,'När svaret inte är ett heltal','35+15x=130','Ekvationen ger sex och en tredjedel. Men hela åkturer måste räknas som heltal.',VGroup(math(r'x=\frac{95}{15}=6\frac13',56).move_to([0,.4,0]),text('Högst 6 hela åkturer inom 130 kr.',29,GOLD).move_to([0,-1.2,0])))
        self.beat(11,'Ditt eget modellproblem','20+8x=76','En cykeluthyrning tar 20 kronor i startavgift och 8 kronor per timme. Hur många timmar ger 76 kronor?',VGroup(math(r'x=\text{antal timmar}',43,MINT).move_to([0,.3,0]),text('Pausa. Rita, lös och kontrollera.',29,GOLD).move_to([0,-1.2,0])))
        self.beat(12,'Lös och tolka','8x=56','Subtrahera 20 och dela med 8. Svaret är sju timmar. Kontroll: 20 plus 56 är 76.',VGroup(math(r'x=7\ \text{timmar}',58,MINT).move_to([0,.3,0]),math(r'20+8\cdot7=76',48).move_to([0,-1.3,0])))
        self.finish()

class BadaLed(AlgebraFilm):
    number=6;title='Obekanta i båda leden';slug='06-bada-led'
    def construct(self):
        left=VGroup(group(4,'x',MINT,4),group(2,'1',GOLD,2)).arrange(DOWN,buff=.2).move_to([-3.4,-.3,0]);right=VGroup(group(2,'x',MINT,2),group(12,'1',GOLD,4)).arrange(DOWN,buff=.2).move_to([3.4,-.3,0])
        self.beat(1,'Samma x i båda leden','4x+2=2x+12','Bokstaven har samma värde överallt. Vi vill samla x-termerna på en sida.',VGroup(left,right,math('=',47,MUTED)))
        self.beat(2,'Välj en operation som hjälper','4x+2-2x=2x+12-2x','Ta bort två x från båda leden. Då försvinner x-termerna i högerledet.',VGroup(left.copy(),right.copy(),math('=',47,MUTED)),operation='-2x')
        self.beat(3,'Två lådor återstår','2x+2=12','Fyra x minus två x är två x. Högerledet är nu tolv.',balance(2,2,12))
        self.beat(4,'Ta bort konstanten','2x+2-2=12-2','Subtrahera två från båda leden. Likheten ska fortfarande gälla.',balance(2,2,12),operation='-2',formula_chain=['2x=10'])
        self.beat(5,'Dela i två lika delar',r'\frac{2x}{2}=\frac{10}{2}','Dela båda leden med två. Lösningen blir x lika med fem.',balance(2,0,10),operation=r'\div2',formula_chain=['x=5'])
        self.beat(6,'Kontrollera båda ursprungliga leden','4x+2=2x+12','Sätt in fem på båda sidor. Båda leden får värdet 22.',VGroup(math(r'4\cdot5+2=22',45,MINT).move_to([-3.6,0,0]),math(r'2\cdot5+12=22',45,GOLD).move_to([3.6,0,0]),math('22=22',50).move_to([0,-1.5,0])))
        self.beat(7,'Varför byter termen tecken?',r'4x+2=2x+12\ \Longrightarrow\ 4x-2x=12-2','Teckenbytet kommer från att samma term subtraheras i båda leden.',VGroup(math('-2x',56,GOLD).move_to([-3.5,-.2,0]),math('-2x',56,GOLD).move_to([3.5,-.2,0]),text('Samma operation',29,MINT).move_to([0,-1.5,0])))
        self.beat(8,'En ekvation kan sakna lösning','2x+4=2x+7','Ta bort två x från båda leden. Då återstår påståendet fyra är lika med sju.',VGroup(math('4=7',65,CORAL).move_to([0,.2,0]),text('Falskt för alla x: ingen lösning.',29,CORAL).move_to([0,-1.3,0])),operation='-2x')
        self.beat(9,'En ekvation kan gälla för alla x','2x+4=2(x+2)','Utveckla parentesen. Båda leden är samma uttryck och ger samma värde för varje x.',VGroup(math('2x+4=2x+4',56,MINT).move_to([0,.2,0]),text('Alla värden på x fungerar.',29,MINT).move_to([0,-1.3,0])))
        three=VGroup(*[VGroup(tile(v,c,.9),text(label,23,c)).arrange(DOWN,buff=.25) for v,c,label in [('1',MINT,'en lösning'),('0',CORAL,'ingen lösning'),(r'\infty',GOLD,'alla x')]]).arrange(RIGHT,buff=1.6)
        self.beat(10,'Tre möjliga slut',r'x=5\qquad 4=7\qquad 4=4','En lösning, ingen lösning eller alla x. Läs vad den sista raden faktiskt säger.',three)
        self.beat(11,'Din tur: välj första steget','5x+1=2x+16','Pausa filmen. Samla x på en sida, lös och kontrollera sedan båda leden.',VGroup(math('-2x',50,GOLD).move_to([-3.5,0,0]),math('-2x',50,GOLD).move_to([3.5,0,0]),text('Vilket steg gör du sedan?',29).move_to([0,-1.5,0])))
        self.beat(12,'Följ likheten hela vägen','3x+1=16','Subtrahera ett och dela med tre. x är fem och båda ursprungliga leden blir 26.',VGroup(math('x=5',64,MINT).move_to([0,.3,0]),math(r'5\cdot5+1=2\cdot5+16=26',43).move_to([0,-1.3,0])),formula_chain=['3x=15','x=5'])
        self.finish()
