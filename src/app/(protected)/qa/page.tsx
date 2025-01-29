'use client';

import React from "react";
import { Sheet, SheetHeader, SheetTitle, SheetTrigger, SheetContent } from "@/components/ui/sheet"; // Correct import
import { useProjects } from "@/hooks/use-project";
import { api } from "@/trpc/react";
import AskQuestion from "../dashboard/AskQuestion";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-refernces"; 

const QAPage = () => {
    const { projectId } = useProjects();
    const { data: questions } = api.project.getQuestions.useQuery({ projectId });

    const [questionIndex, setQuestionIndex] = React.useState(0);
    const question = questions?.[questionIndex];

    return (
        <Sheet>
            <AskQuestion />
            <div className="h-4"></div>
            <div className="text-xl font-semibold">Saved Questions</div>
            <div className="h-2"></div>
            <div className="flex flex-col gap-2">
                {questions?.map((question, index) => (
                    <React.Fragment key={question.id}>
                        <SheetTrigger onClick={() => setQuestionIndex(index)}>
                            <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border">
                                <img className="rounded-full" height={30} width={30} src={question.user.imageUrl ?? ""} />
                                <div className="flex text-left flex-col">
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-700 line-clamp-1 text-lg font-medium">
                                            {question.question}
                                        </p>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(question.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 line-clamp-1 text-sm">
                                        {question.answer}
                                    </p>
                                </div>
                            </div>
                        </SheetTrigger>
                    </React.Fragment>
                ))}
            </div>
            {question && (
                <SheetContent className="sm:max-w-[80vw]">
                    <SheetHeader>
                        <SheetTitle>{question.question}</SheetTitle>
                        <div>
                            <MDEditor.Markdown source={question.answer} />
                        </div>
                        <div>
                            <CodeReferences fileReferences={question.fileReferences ?? [] as any} />
                        </div>
                    </SheetHeader>
                </SheetContent>
            )}
        </Sheet>
    );
};

export default QAPage;
