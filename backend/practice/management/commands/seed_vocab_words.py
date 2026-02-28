"""
management command: python manage.py seed_vocab_words

Seeds 150 academic vocabulary words (from AWL sublist families + TOEFL high-frequency vocab)
into the VocabWord model. Safe to re-run — uses get_or_create.

Words are tagged with relevant exam(s) and assigned a difficulty level:
  basic        — common academic words most learners already partially know
  intermediate — AWL core words required for Band 6.5–7 / TOEFL 90+
  advanced     — sophisticated vocabulary for Band 7.5+ / TOEFL 105+
"""

from django.core.management.base import BaseCommand
from practice.models import VocabWord


# Format: (word, definition, example, exam_tags, difficulty)
WORDS = [
    # ── Academic Verbs ─────────────────────────────────────────────────────────
    (
        "analyse",
        "v. To examine something in detail in order to understand it or explain it.",
        "The researcher analysed the data from 500 participants before drawing conclusions.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "assess",
        "v. To judge or decide the amount, value, quality, or importance of something.",
        "The committee will assess each application based on merit and financial need.",
        ["ielts", "toefl", "pte", "oet"],
        "basic",
    ),
    (
        "conclude",
        "v. To decide something after considering all the information available.",
        "The study concluded that regular exercise reduces the risk of heart disease by 30%.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "define",
        "v. To explain the precise meaning of a word, concept, or phenomenon.",
        "It is important to clearly define the key terms before beginning the analysis.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "establish",
        "v. To set up or create something that is intended to last; to show that something is definitely true.",
        "The researchers established a clear link between diet and cognitive performance.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "indicate",
        "v. To show that something exists or is likely; to point towards something.",
        "The survey results indicate a growing preference for remote working arrangements.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "obtain",
        "v. To get or acquire something, especially through effort.",
        "Candidates must obtain a minimum score of 7.0 to be considered for the programme.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "require",
        "v. To need something or make it necessary; to officially demand something.",
        "The visa application requires applicants to provide proof of financial support.",
        ["ielts", "toefl", "celpip"],
        "basic",
    ),
    (
        "suggest",
        "v. To put forward an idea or plan for someone to consider; to imply.",
        "The evidence suggests that urban air quality has improved over the past decade.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "identify",
        "v. To recognise and name something; to establish who or what something is.",
        "The audit identified several areas where costs could be significantly reduced.",
        ["ielts", "toefl", "pte", "oet"],
        "basic",
    ),
    (
        "demonstrate",
        "v. To show clearly that something exists or is true by providing proof.",
        "The pilot study demonstrated that the new teaching method improved test scores.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "evaluate",
        "v. To judge or calculate the quality, importance, or value of something.",
        "Students are expected to critically evaluate sources before citing them.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "constitute",
        "v. To be or form a particular thing; to make up or compose a whole.",
        "Informal employment constitutes over 40% of the workforce in developing economies.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "interpret",
        "v. To explain the meaning of something; to understand it in a particular way.",
        "Scholars interpret the poem differently depending on their cultural background.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "attribute",
        "v. To say that something is caused by or associated with a particular factor.",
        "The improvement in student outcomes was attributed to the new mentoring programme.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "contribute",
        "v. To give or add something in order to help achieve or produce something.",
        "Physical inactivity contributes significantly to the rising rates of obesity.",
        ["ielts", "toefl", "pte", "oet"],
        "intermediate",
    ),
    (
        "derive",
        "v. To get or obtain something from a source; to originate from.",
        "Many English scientific terms are derived from Latin and Greek roots.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "sustain",
        "v. To maintain something over time; to keep something going.",
        "It is difficult to sustain economic growth without investment in education.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "facilitate",
        "v. To make an action or process easier; to help something happen.",
        "Technology can facilitate communication between students and teachers.",
        ["ielts", "toefl", "pte", "celpip"],
        "intermediate",
    ),
    (
        "implement",
        "v. To put a plan, system, or decision into effect.",
        "The government has pledged to implement the new transport policy by 2027.",
        ["ielts", "toefl", "pte", "celpip"],
        "intermediate",
    ),
    (
        "acknowledge",
        "v. To accept or admit the truth of something; to recognise the existence of something.",
        "The report acknowledges several limitations that may affect the validity of the findings.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "compensate",
        "v. To give something to make up for a loss, damage, or disadvantage.",
        "Higher salaries may compensate for the increased workload during peak periods.",
        ["ielts", "toefl", "celpip"],
        "intermediate",
    ),
    (
        "contradict",
        "v. To say something that is opposite to or inconsistent with another statement.",
        "The new evidence directly contradicts the findings of the earlier study.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "hypothesise",
        "v. To propose an explanation based on limited evidence as a starting point for investigation.",
        "The team hypothesised that increased sunlight exposure would boost vitamin D levels.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "undermine",
        "v. To weaken or damage something gradually, often covertly.",
        "Constant interruptions can undermine a student's ability to concentrate.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "perpetuate",
        "v. To cause something to continue indefinitely.",
        "Media stereotypes can perpetuate harmful social biases across generations.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "mitigate",
        "v. To make something less harmful, serious, or painful.",
        "Tree planting schemes can help mitigate the effects of urban air pollution.",
        ["ielts", "toefl", "pte"],
        "advanced",
    ),
    (
        "exacerbate",
        "v. To make a problem or bad situation worse.",
        "Poor housing conditions can exacerbate respiratory illnesses in children.",
        ["ielts", "toefl", "oet"],
        "advanced",
    ),
    (
        "proliferate",
        "v. To increase rapidly in number or spread quickly.",
        "Misinformation tends to proliferate quickly on social media platforms.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "reconcile",
        "v. To find a way to make two apparently contradictory things coexist.",
        "It is challenging to reconcile economic growth with environmental sustainability.",
        ["ielts", "toefl"],
        "advanced",
    ),

    # ── Academic Nouns ─────────────────────────────────────────────────────────
    (
        "analysis",
        "n. A detailed examination of something in order to understand or explain it.",
        "A thorough analysis of the data revealed three distinct consumer groups.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "approach",
        "n. A way of dealing with a situation or problem; a method.",
        "The teacher used a student-centred approach to encourage critical thinking.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "concept",
        "n. An abstract idea or a general notion.",
        "The concept of supply and demand is fundamental to understanding economics.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "evidence",
        "n. The available facts or information that indicate whether a belief is true.",
        "The prosecution presented compelling evidence to support its case.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "factor",
        "n. A circumstance, fact, or influence that contributes to a result.",
        "Stress is a key factor in the development of many chronic health conditions.",
        ["ielts", "toefl", "pte", "oet"],
        "basic",
    ),
    (
        "impact",
        "n. A strong effect or influence on something.",
        "The impact of social media on young people's mental health is widely debated.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "process",
        "n. A series of actions or steps taken to achieve a particular goal.",
        "The digestive process begins in the mouth when food is broken down by enzymes.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "structure",
        "n. The arrangement and organisation of parts in a system or object.",
        "The essay should follow a clear structure: introduction, body, and conclusion.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "function",
        "n. The purpose or role of something; what something does.",
        "The primary function of the kidney is to filter waste from the blood.",
        ["ielts", "toefl", "pte", "oet"],
        "basic",
    ),
    (
        "significance",
        "n. The quality of being important or having great meaning.",
        "The significance of the discovery was not fully understood for decades.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "assumption",
        "n. Something that is accepted as true without proof.",
        "The model relies on the assumption that consumers act rationally.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "consequence",
        "n. A result or effect of an action or condition.",
        "The long-term consequences of climate change are still difficult to predict.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "context",
        "n. The circumstances in which something happens; the background information.",
        "It is important to consider the historical context when interpreting political events.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "framework",
        "n. A basic structure or set of principles used to organise thinking or action.",
        "The researchers developed a new theoretical framework for analysing consumer behaviour.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "perspective",
        "n. A particular way of viewing or thinking about something.",
        "The book examines colonialism from the perspective of the colonised population.",
        ["ielts", "toefl", "celpip"],
        "intermediate",
    ),
    (
        "implication",
        "n. A conclusion that can be drawn from something; a likely consequence.",
        "The research has important implications for public health policy.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "criterion",
        "n. A standard or principle by which something is judged (plural: criteria).",
        "Applicants must meet several strict criteria to qualify for the scholarship.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "phenomenon",
        "n. A fact or situation that is observed to exist, especially one that is remarkable.",
        "The Aurora Borealis is a natural phenomenon caused by solar activity.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "methodology",
        "n. A system of methods used in a particular area of study or activity.",
        "The paper describes the research methodology in detail in the third section.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "hypothesis",
        "n. A proposed explanation that can be tested through investigation.",
        "The experiment was designed to test the hypothesis that plants grow faster in blue light.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "paradigm",
        "n. A typical example or pattern of something; a model or framework for thinking.",
        "The internet represented a paradigm shift in how people access information.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "disparity",
        "n. A great difference between two things; inequality.",
        "There is a significant disparity between educational outcomes in urban and rural areas.",
        ["ielts", "toefl", "celpip"],
        "advanced",
    ),
    (
        "ambiguity",
        "n. The quality of being open to more than one interpretation; uncertainty.",
        "The ambiguity in the law's wording led to conflicting court rulings.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "trajectory",
        "n. The path along which something moves; the course of development.",
        "The career trajectory of most graduates has changed significantly since 2010.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "catalyst",
        "n. Something that causes or speeds up a process or change.",
        "The 2008 financial crisis acted as a catalyst for wide-ranging banking reforms.",
        ["ielts", "toefl"],
        "advanced",
    ),

    # ── Discourse Markers & Linking Language ──────────────────────────────────
    (
        "furthermore",
        "adv. In addition to what has already been said; used to add a stronger point.",
        "The product is affordable; furthermore, it is available in all major retail stores.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "nevertheless",
        "adv. In spite of what has just been said; despite that.",
        "The task was challenging; nevertheless, the team completed it ahead of schedule.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "consequently",
        "adv. As a result of something that has just been mentioned.",
        "The factory was closed due to safety violations; consequently, 400 workers lost their jobs.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "whereas",
        "conj. In contrast or comparison to the fact that.",
        "Northern regions experienced record snowfall, whereas the south remained unusually warm.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "albeit",
        "conj. Although; even though.",
        "The experiment produced useful results, albeit on a very small scale.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "nonetheless",
        "adv. Despite what has just been said; in spite of that.",
        "There are risks associated with the treatment; nonetheless, most patients benefit significantly.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "thereby",
        "adv. By that means; as a result of that.",
        "The new algorithm reduces processing time, thereby improving overall system efficiency.",
        ["ielts", "toefl"],
        "advanced",
    ),

    # ── Topic: Environment ──────────────────────────────────────────────────────
    (
        "emission",
        "n. The production and discharge of something, especially gas or radiation.",
        "Carbon emissions from the transport sector have increased by 15% since 2015.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "renewable",
        "adj. Relating to energy from sources that are naturally replenished.",
        "Investment in renewable energy sources has grown dramatically over the past decade.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "sustainable",
        "adj. Able to be maintained over time without harming the environment.",
        "Sustainable farming practices help protect soil quality for future generations.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "biodiversity",
        "n. The variety of plant and animal life in the world or in a particular habitat.",
        "Deforestation is one of the greatest threats to biodiversity on the planet.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "deforestation",
        "n. The clearing of forests on a large scale, often resulting in damage to the environment.",
        "Deforestation in the Amazon has accelerated as demand for agricultural land increases.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "ecosystem",
        "n. A biological community of interacting organisms and their physical environment.",
        "Coral reefs are among the most diverse ecosystems on Earth.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "mitigation",
        "n. The action of reducing the severity or impact of something.",
        "Flood mitigation strategies include building levees and restoring wetlands.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "anthropogenic",
        "adj. Originating in human activity; caused by humans.",
        "Most scientists agree that recent climate change is primarily anthropogenic.",
        ["ielts", "toefl"],
        "advanced",
    ),

    # ── Topic: Technology ──────────────────────────────────────────────────────
    (
        "innovation",
        "n. A new method, idea, product, or process; the act of introducing something new.",
        "Technological innovation has transformed virtually every sector of the economy.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "automation",
        "n. The use of machines or technology to perform tasks with minimal human involvement.",
        "Automation in manufacturing has increased productivity but displaced many workers.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "algorithm",
        "n. A step-by-step set of instructions for solving a problem or completing a task.",
        "Social media platforms use algorithms to determine which content users see first.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "cybersecurity",
        "n. The practice of protecting systems, networks, and data from digital attacks.",
        "Governments are investing heavily in cybersecurity to protect critical infrastructure.",
        ["ielts", "toefl", "celpip"],
        "intermediate",
    ),
    (
        "digital literacy",
        "n. The ability to use digital technologies effectively and critically.",
        "Digital literacy is now considered an essential skill in most workplaces.",
        ["ielts", "toefl", "celpip"],
        "intermediate",
    ),
    (
        "artificial intelligence",
        "n. The simulation of human intelligence processes by machines, especially computer systems.",
        "Artificial intelligence is being used to detect cancer in medical images.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "surveillance",
        "n. Close observation of a person or group, especially by authorities.",
        "The expansion of digital surveillance raises serious questions about privacy rights.",
        ["ielts", "toefl"],
        "advanced",
    ),

    # ── Topic: Society & Education ────────────────────────────────────────────
    (
        "urbanisation",
        "n. The process by which more people come to live and work in cities.",
        "Rapid urbanisation has created serious infrastructure challenges in many developing nations.",
        ["ielts", "toefl", "pte", "celpip"],
        "intermediate",
    ),
    (
        "inequality",
        "n. The unequal distribution of wealth, opportunities, or privileges.",
        "Income inequality has widened significantly in many developed countries since the 1980s.",
        ["ielts", "toefl", "pte", "celpip"],
        "intermediate",
    ),
    (
        "meritocracy",
        "n. A system in which advancement is based on individual ability or achievement.",
        "Critics argue that the ideal of meritocracy masks deep structural inequalities.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "curriculum",
        "n. The subjects comprising a course of study in a school or college.",
        "There are calls to update the school curriculum to include financial literacy.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "literacy",
        "n. The ability to read and write; competence in a specified area.",
        "Financial literacy programmes help adults manage their personal budgets effectively.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "marginalised",
        "adj. Treated as unimportant or excluded from mainstream society.",
        "The policy aims to improve healthcare access for marginalised communities.",
        ["ielts", "toefl", "celpip"],
        "advanced",
    ),
    (
        "assimilation",
        "n. The process by which a person or group takes on the culture and identity of another group.",
        "Debates about assimilation are central to policy discussions on immigration.",
        ["ielts", "toefl", "celpip"],
        "advanced",
    ),
    (
        "infrastructure",
        "n. The basic physical and organisational structures needed for a society to function.",
        "Ageing infrastructure is a major challenge for many post-industrial cities.",
        ["ielts", "toefl", "pte", "celpip"],
        "intermediate",
    ),

    # ── Topic: Health ──────────────────────────────────────────────────────────
    (
        "prevalence",
        "n. The fact or condition of being widespread; the proportion of a population with a condition.",
        "The prevalence of type 2 diabetes has tripled over the past three decades.",
        ["ielts", "toefl", "oet"],
        "intermediate",
    ),
    (
        "prognosis",
        "n. A forecast of the likely outcome of a situation, especially a medical one.",
        "With early treatment, the prognosis for most patients is very positive.",
        ["oet", "ielts"],
        "advanced",
    ),
    (
        "chronic",
        "adj. Persisting for a long time; of a disease: long-lasting and recurring.",
        "Chronic pain can have a profound effect on a patient's quality of life.",
        ["oet", "ielts", "toefl"],
        "intermediate",
    ),
    (
        "diagnosis",
        "n. The identification of an illness or problem by its signs and symptoms.",
        "Early diagnosis significantly improves outcomes for most forms of cancer.",
        ["oet", "ielts", "toefl"],
        "basic",
    ),
    (
        "intervention",
        "n. Action taken to improve a situation, especially in a medical or social context.",
        "A brief counselling intervention reduced alcohol consumption in high-risk patients.",
        ["oet", "ielts", "toefl"],
        "intermediate",
    ),
    (
        "compliance",
        "n. The action of obeying a rule or following recommendations; in medicine: adherence to treatment.",
        "Poor medication compliance is a major cause of treatment failure in chronic disease management.",
        ["oet", "ielts"],
        "intermediate",
    ),
    (
        "contraindication",
        "n. A condition that makes a particular treatment inadvisable.",
        "Pregnancy is a contraindication for many medications used to treat rheumatoid arthritis.",
        ["oet"],
        "advanced",
    ),
    (
        "aetiology",
        "n. The cause or set of causes of a disease or condition.",
        "The aetiology of multiple sclerosis is not yet fully understood.",
        ["oet"],
        "advanced",
    ),
    (
        "holistic",
        "adj. Treating the whole person rather than just the symptoms of a condition.",
        "The clinic takes a holistic approach to patient care, addressing physical and mental wellbeing.",
        ["oet", "ielts"],
        "intermediate",
    ),

    # ── Adjectives & Adverbs ──────────────────────────────────────────────────
    (
        "significant",
        "adj. Large enough to be important or noticeable.",
        "There was a significant increase in renewable energy use between 2015 and 2023.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "substantial",
        "adj. Of considerable size, value, or importance.",
        "The company reported a substantial improvement in profits in the second quarter.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "coherent",
        "adj. Logical, consistent, and forming a unified whole.",
        "A coherent argument is essential for achieving a high band score in writing.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "ambiguous",
        "adj. Open to more than one interpretation; not clear or decided.",
        "The wording of the question was ambiguous, leading students to answer in different ways.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "empirical",
        "adj. Based on observation or experience rather than theory.",
        "The study provides empirical evidence that diet affects mood and cognitive function.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "inherent",
        "adj. Existing as a natural or permanent quality of something.",
        "There are inherent risks in any surgical procedure, however routine.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "prevalent",
        "adj. Widespread; commonly occurring in a particular area or at a particular time.",
        "Sedentary lifestyles are prevalent in many high-income countries.",
        ["ielts", "toefl", "oet"],
        "intermediate",
    ),
    (
        "feasible",
        "adj. Possible to do easily or conveniently; practicable.",
        "The engineers confirmed that the project was technically and financially feasible.",
        ["ielts", "toefl", "celpip"],
        "intermediate",
    ),
    (
        "inevitable",
        "adj. Certain to happen; unable to be avoided.",
        "Some degree of job displacement is inevitable as automation expands.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "disproportionate",
        "adj. Too large or too small in relation to something else; out of proportion.",
        "The policy had a disproportionate impact on low-income households.",
        ["ielts", "toefl", "celpip"],
        "advanced",
    ),

    # ── AWL Sublist 2 Highlights ───────────────────────────────────────────────
    (
        "achieve",
        "v. To successfully bring about a desired result through effort or skill.",
        "Students who set specific goals are more likely to achieve academic success.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "benefit",
        "n/v. An advantage gained from something; to receive an advantage.",
        "Regular aerobic exercise benefits both physical and mental health.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "challenge",
        "n/v. A task that requires effort and skill; to dispute the validity of something.",
        "One of the greatest challenges facing modern cities is affordable housing.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "distribution",
        "n. The way in which something is spread over an area or divided among people.",
        "The distribution of wealth across society has become increasingly uneven.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "environment",
        "n. The surroundings or conditions in which a person lives or operates; the natural world.",
        "Governments must balance economic growth with protecting the natural environment.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "policy",
        "n. A course of action adopted by a government, party, or organisation.",
        "The new immigration policy has been the subject of intense public debate.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "sector",
        "n. A distinct part or area, especially of an economy, society, or sphere of activity.",
        "The technology sector has been the fastest-growing part of the economy.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "variable",
        "n/adj. An element that can change; not consistent or having a fixed pattern.",
        "Temperature is a key variable that affects the speed of chemical reactions.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "principle",
        "n. A fundamental truth or proposition that serves as the foundation for reasoning.",
        "The principle of equal opportunity underpins the country's education policy.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "resource",
        "n. A stock or supply of materials, staff, money, or assets that can be drawn on.",
        "Developing nations often lack the resources needed to build effective health systems.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),

    # ── Cause & Effect ──────────────────────────────────────────────────────────
    (
        "trigger",
        "v/n. To cause something to start; the event or factor that causes something to happen.",
        "Stress is known to trigger episodes of irritable bowel syndrome in some patients.",
        ["ielts", "toefl", "oet"],
        "intermediate",
    ),
    (
        "correlate",
        "v. To have a mutual relationship; to show a connection between two things.",
        "Higher levels of education correlate strongly with longer life expectancy.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "stem from",
        "v. To originate from; to be caused by.",
        "Many behavioural problems in adults can stem from early childhood experiences.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "underpin",
        "v. To support or provide the basis for something.",
        "Empirical research underpins many of the recommendations in the government's health strategy.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "culminate",
        "v. To reach a final or climactic point; to result in something.",
        "Years of diplomatic effort culminated in the signing of the historic peace treaty.",
        ["ielts", "toefl"],
        "advanced",
    ),

    # ── Quantifiers & Hedging ─────────────────────────────────────────────────
    (
        "approximately",
        "adv. Used to show that a figure or amount is not exact; roughly.",
        "Approximately 70% of Earth's surface is covered by water.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "predominantly",
        "adv. Mainly; for the most part.",
        "The population of the city is predominantly under the age of 40.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "marginally",
        "adv. To only a small extent; by a small amount.",
        "Test scores in the experimental group were only marginally higher than in the control group.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "substantially",
        "adv. To a great or significant extent.",
        "Housing costs have increased substantially over the past decade in most major cities.",
        ["ielts", "toefl", "pte", "celpip"],
        "intermediate",
    ),
    (
        "arguably",
        "adv. It could be argued or said; used to present a view that may be disputed.",
        "The internet is arguably the most transformative invention of the twentieth century.",
        ["ielts", "toefl"],
        "advanced",
    ),

    # ── More AWL & High-Frequency Academic Words ──────────────────────────────
    (
        "adjacent",
        "adj. Next to or adjoining something else.",
        "The two research teams worked in adjacent offices and collaborated closely.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "commodity",
        "n. A raw material or primary agricultural product that can be bought and sold.",
        "Oil remains the world's most traded commodity, influencing global economic stability.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "diverse",
        "adj. Showing a great deal of variety; very different.",
        "The city is home to a diverse population with over 80 languages spoken.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "explicit",
        "adj. Stated clearly and in detail, leaving no room for confusion.",
        "The contract contains explicit clauses outlining the responsibilities of each party.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "generate",
        "v. To produce or create something.",
        "The new policy is expected to generate thousands of jobs in the renewable energy sector.",
        ["ielts", "toefl", "pte", "celpip"],
        "basic",
    ),
    (
        "hierarchy",
        "n. A system in which people or things are ranked above one another.",
        "The corporate hierarchy determines who makes final decisions on major projects.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "implicit",
        "adj. Suggested or understood without being directly expressed.",
        "There is an implicit assumption in the argument that economic growth is always desirable.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "incentive",
        "n. A thing that motivates or encourages someone to do something.",
        "Tax incentives have been introduced to encourage businesses to reduce carbon emissions.",
        ["ielts", "toefl", "pte", "celpip"],
        "intermediate",
    ),
    (
        "inherently",
        "adv. In a way that is a permanent, essential quality of something.",
        "Some tasks are inherently repetitive and are therefore suited to automation.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "integrate",
        "v. To combine one thing with another to form a whole; to include within a larger group.",
        "Schools are working to integrate technology into everyday classroom instruction.",
        ["ielts", "toefl", "pte", "celpip"],
        "intermediate",
    ),
    (
        "justify",
        "v. To show or prove that something is right or reasonable.",
        "The researchers struggled to justify the high cost of the clinical trial.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "manifest",
        "v/adj. To display or show something; clearly apparent.",
        "Stress can manifest in a wide variety of physical and psychological symptoms.",
        ["ielts", "toefl", "oet"],
        "advanced",
    ),
    (
        "monitor",
        "v. To observe and check the progress or quality of something over time.",
        "Healthcare professionals must carefully monitor patients on long-term medication.",
        ["ielts", "toefl", "pte", "oet"],
        "basic",
    ),
    (
        "negate",
        "v. To make ineffective; to deny the existence or truth of something.",
        "A single counterexample is enough to negate a universal claim.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "objective",
        "adj/n. Not influenced by personal feelings; a goal or aim.",
        "The study design was intended to provide an objective assessment of both treatments.",
        ["ielts", "toefl", "pte"],
        "basic",
    ),
    (
        "orient",
        "v. To align or position something relative to a goal or direction.",
        "The programme is oriented towards developing practical workplace communication skills.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "parameter",
        "n. A limit or boundary that defines the scope of something.",
        "The experiment was conducted within the parameters set by the ethics committee.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "perceive",
        "v. To become aware of something through the senses; to interpret in a particular way.",
        "How we perceive risk is often influenced more by emotion than by statistical evidence.",
        ["ielts", "toefl"],
        "intermediate",
    ),
    (
        "persist",
        "v. To continue firmly in a course of action despite difficulty; to remain.",
        "Racial disparities in education persist despite decades of policy reform.",
        ["ielts", "toefl", "celpip"],
        "intermediate",
    ),
    (
        "preliminary",
        "adj. Done before the main event or action; initial.",
        "Preliminary findings suggest the drug is effective, though larger trials are needed.",
        ["ielts", "toefl", "oet"],
        "intermediate",
    ),
    (
        "rationale",
        "n. A set of reasons or a logical basis for a course of action.",
        "The government published a detailed rationale for the proposed changes to the tax system.",
        ["ielts", "toefl"],
        "advanced",
    ),
    (
        "reinforce",
        "v. To strengthen or support something; to make an existing feeling or belief stronger.",
        "Positive feedback from teachers can reinforce a student's motivation to learn.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "simulate",
        "v. To imitate the appearance or character of something; to reproduce conditions artificially.",
        "Engineers use software to simulate the effects of extreme weather on building structures.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "subsequent",
        "adj. Coming after or following something else.",
        "The initial results were promising; subsequent trials confirmed the drug's efficacy.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
    (
        "underlying",
        "adj. Existing beneath the surface; fundamental to something else.",
        "Poverty is often the underlying cause of many social and health problems.",
        ["ielts", "toefl", "oet"],
        "intermediate",
    ),
    (
        "validate",
        "v. To confirm or prove the accuracy, truth, or worth of something.",
        "Further research is needed to validate the findings from this small-scale study.",
        ["ielts", "toefl", "pte"],
        "intermediate",
    ),
]


class Command(BaseCommand):
    help = "Seed 150 academic vocabulary words for the Vocab Tracker"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing VocabWord entries before re-seeding",
        )

    def handle(self, *args, **options):
        if options.get("reset"):
            deleted, _ = VocabWord.objects.all().delete()
            self.stdout.write(f"  Reset: deleted {deleted} existing vocab words")

        created_count = 0
        updated_count = 0

        for i, (word, definition, example, exam_tags, difficulty) in enumerate(WORDS):
            obj, created = VocabWord.objects.get_or_create(
                word=word,
                defaults={
                    "definition": definition,
                    "example": example,
                    "exam_tags": exam_tags,
                    "difficulty": difficulty,
                    "order": i + 1,
                },
            )
            if created:
                created_count += 1
            else:
                # Update content if already exists
                updated = False
                for field, val in [
                    ("definition", definition),
                    ("example", example),
                    ("exam_tags", exam_tags),
                    ("difficulty", difficulty),
                    ("order", i + 1),
                ]:
                    if getattr(obj, field) != val:
                        setattr(obj, field, val)
                        updated = True
                if updated:
                    obj.save()
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {created_count} words created, {updated_count} updated. "
                f"Total: {VocabWord.objects.count()} vocab words."
            )
        )
