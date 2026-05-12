const User=require("../models/userSchema.js");
const Interview=require("../models/interviewSchema.js");
const Question=require("../models/questionSchema.js");
const generateContent=require("../utils/gemini.js")
const { PDFParse } = require('pdf-parse');

const startInterview=async(req,res)=>{
    console.log(req.body);
    console.log(req.file.filename);
    console.log(req.file.path);
    try{
        const filename=req.file.filename;
        const resumePath=req.file.path

        const currInterview=req.body;
        const newInterview = new Interview({
      ...currInterview,
      userId: req.user.userId ,
      resume:{
        filename:filename,
        path:resumePath,
      }
    });


        await newInterview.save();
        const thisInterview=Interview.findById(newInterview.id);
        return res.status(200).json({
            success:true,
            interviewId:newInterview._id,
        })
    }
    catch(err){
        console.log(err);
    }
}

const setupInterview=async(req,res)=>{
    const interviewId = req.params.id; 
    
    const interview=await Interview.findById(interviewId);

    return res.json({
        data:interview,
    });
}

const generateQuestion=async(req,res)=>{
    const interviewId=req.params.id;

    const interview=await Interview.findById(interviewId);

    const conversation_history=await Question.find({interviewId:interviewId}).sort({ order: 1 });

    
    const prev_queAndans=conversation_history.map((q, index) =>
                            `Q${index + 1}: ${q.question}\nA${index + 1}: ${q.answer}`
                        )
                        .join("\n\n");

    const parser = new PDFParse({ url: interview.resume.path });
    const parsingResult = await parser.getText();

    let resumeText=parsingResult.text;

    
    const prompt = `You are an expert technical interviewer conducting a real-time mock interview.

                    Candidate Profile:
                    - Name: ${interview.name}
                    - Role: ${interview.role}
                    - Interview Type: ${interview.interviewType}
                    - Difficulty Level: ${interview.difficulty}

                    Resume Information:
                    ${resumeText}

                    Interview History:
                    ${prev_queAndans}

                    Your Responsibilities:
                    1. Conduct a structured technical interview for given role.
                    2. Generate ONLY ONE question at a time.
                    3. STRICTLY tailor questions based on the candidate's resume:
                    - Ask questions from their projects
                    - Focus on their tech stack
                    - Include questions based on their skills
                    4. Start with fundamentals if difficulty is Easy.
                    5. Gradually increase difficulty based on performance.
                    6. If candidate performs well → ask deeper, real-world or system design questions.
                    7. If candidate struggles → simplify and reinforce basics.
                    8. Maintain continuity using previous questions and answers.
                    9. Make the interview feel natural and human-like.

                    STRICT RULES:
                    - Do NOT repeat previous questions
                    - Do NOT provide answers or hints
                    - Do NOT ask multiple questions
                    - Stay strictly within SDE technical domain
                    - Prefer resume-based questions over generic ones

                    OUTPUT FORMAT (VERY IMPORTANT):
                    Return ONLY valid JSON.
                    Do NOT use markdown or code blocks.

                    Format:
                    { "question": "your question here" }
                    `


    const result=await generateContent(prompt);
    const jsonRes=JSON.parse(result);
    const new_question=jsonRes.question;
    
    return res.status(200).json({
            success:true,
            question:new_question,
    })
}

const evaluateAns=async(req,res)=>{
    const interviewId=req.params.id;

    const interview=await Interview.findById(interviewId);

    const currQuestion=req.body.question;
    const currAnswer=req.body.answer;


     const conversation_history=await Question.find({interviewId:interviewId}).sort({ order: 1 });
     const order=conversation_history.length+1;

    const prev_queAndans=conversation_history.map((q, index) =>
                            `Q${index + 1}: ${q.question}\nA${index + 1}: ${q.answer}`
                        )
                        .join("\n\n");

  
    const prompt=`You are an expert technical interviewer evaluating a candidate’s answer in a mock interview.

                    Candidate Profile:
                    - Role: ${interview.role}
                    - Difficulty Level: ${interview.difficulty}
                    -Interview Type : ${interview.interviewType}

                    Interview History:
                    ${prev_queAndans}

                    Current Question:
                    ${currQuestion}

                    Candidate Answer:
                    ${currAnswer}

                    Your Responsibilities:
                    1. Evaluate the candidate's answer for:
                    - Technical correctness
                    - Completeness
                    - Clarity
                    2. Consider previous context to judge consistency and understanding.
                    3. Provide an ideal answer that a strong candidate would give.
                    4. Give a score out of 10.
                    5. Provide concise and actionable feedback.

                    STRICT RULES:
                    - Do NOT ask a new question
                    - Keep ideal answer clear and structured (not overly long)
                    - Feedback should be constructive and specific
                    - Be realistic like a real interviewer

                    OUTPUT FORMAT (VERY IMPORTANT):
                    Return ONLY valid JSON:

                    {
                    "score": number,
                    "ideal_answer": "string",
                    "feedback": "string"
                    }`

    const result=await generateContent(prompt);
    const jsonRes=JSON.parse(result);

    const idealAnswer=jsonRes.ideal_answer;
    const score=jsonRes.score;
    const feedback=jsonRes.feedback;

    const newConversation=new Question(
        {

        interviewId: interviewId,
        
            order:order+1,
        
            question:currQuestion,
        
            answer:currAnswer,
        
            idealAnswer:idealAnswer,
        
            score:score,
        
            feedback: feedback,
          },
    )
    await newConversation.save();

    return res.json(
        {
            success:true,
            message:"answer evaluated"
        }
    )
   
}

const endInterview=async(req,res)=>{
    try{
        const interviewId=req.params.id;

        const interview=await Interview.findById(interviewId);

        if(!interview){
            return res.status(404).json({
                success:false,
                message:"Interview not found"
            })
        }

        const conversation_history=await Question.find({interviewId:interviewId}).sort({ order: 1 });

        const prompt=`You are an expert AI interviewer evaluating a candidate's performance.

                    You are given:
                    1. Interview details
                    2. Full conversation history

                    Your task is to generate:
                    - A final score out of 100
                    - Structured and meaningful feedback

                    -------------------------
                    INTERVIEW DETAILS:
                    - Role: ${interview.role}
                    - Interview Type: ${interview.interviewType} (HR / Technical / Mixed)
                    - Difficulty Level: ${interview.difficulty} (Easy / Medium / Hard)
                    - Expected Duration: ${interview.duration}
                    - Mode: Candidate(${interview.userMode}) / AI(${interview.AIMode})
                    -------------------------

                    EVALUATION CRITERIA:

                    1. Technical Evaluation (for Technical/Mixed interviews):
                    - Correctness of answers
                    - Depth of understanding
                    - Problem-solving ability
                    - Ability to handle follow-up questions

                    2. HR Evaluation (for HR/Mixed interviews):
                    - Communication skills
                    - Clarity of thought
                    - Confidence
                    - Relevance of answers

                    3. Difficulty Adjustment:
                    - For EASY interviews → expectations are lower, scoring should be stricter
                    - For HARD interviews → reward partial correctness and effort more

                    4. CRITICAL RULE (IMPORTANT):
                    - Analyze how many questions were asked vs how many were answered
                    - If candidate exits early or answers only a few questions:
                        → Heavily penalize the score
                        → DO NOT give high marks even if answers are correct

                    5. Completion Behavior:
                    - Detect if interview was completed properly
                    - Detect early exit or lack of participation

                    6. Answer Quality:
                    - Penalize vague, short, or generic answers
                    - Reward structured, step-by-step explanations

                    7. Consistency:
                    - Check if candidate improved or degraded during interview

                    -------------------------
                    SCORING RULES:

                    - 90–100 → Excellent (strong performance, completed interview)
                    - 70–89 → Good (minor gaps, mostly complete)
                    - 50–69 → Average (partial knowledge OR incomplete interview)
                    - 30–49 → Poor (few answers, weak understanding)
                    - 0–29 → Very Poor (early exit / minimal participation)

                    IMPORTANT:
                    A candidate who did NOT complete the interview should NOT score above 60.

                    -------------------------
                    OUTPUT FORMAT (STRICT JSON):
                    Return ONLY valid JSON.
                    Do NOT use markdown or code blocks.
                    {
                    "score": number (0-100),
                    "summary": "Short 2-3 line summary",
                    "strengths": "points",
                    "weaknesses": "points",
                    "feedback": "Role-specific detailed evaluation",
                    "completion_assessment": "Completed / Partially Completed / Exited Early"
                    }

                    -------------------------
                    CONVERSATION:
                    ${conversation_history}`

        const result=await generateContent(prompt);
        const jsonRes=JSON.parse(result);

        console.log(jsonRes);
        interview.totalScore=jsonRes.score;
        interview.summary=jsonRes.summary;
        interview.strengths=jsonRes.strengths;
        interview.weaknesses=jsonRes.weaknesses;
        interview.feedback=jsonRes.feedback;
        interview.completion_assessment=jsonRes.completion_assessment;
        interview.status="completed";
        interview.commpletion_time=new Date();

        await interview.save();

        return res.status(200).json({
            success:true,
            message:"Interview ended successfully",
            data:jsonRes,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to end interview"
        })
    }
}

const getResult=async(req,res)=>{
    const userId=req.user.userId;
    
    const result=await Interview.find({userId});


    return res.status(200).json(
        {
            success:true,
            history:result,
        }
    )
}

const getInterview=async(req,res)=>{
    const interviewId=req.params.id;

    const interview=await Interview.findById(interviewId);
    const Questions=await Question.find({interviewId:interviewId}).sort({ order: 1 });

    return res.status(200).json({
        success:true,
        interview:interview,
        questions:Questions,
    })
}

module.exports={startInterview,setupInterview,generateQuestion,evaluateAns,endInterview,getResult,getInterview};