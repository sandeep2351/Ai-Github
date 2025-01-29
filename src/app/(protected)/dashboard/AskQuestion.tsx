'use-client'

import MDEditor from '@uiw/react-md-editor';
import { useProjects } from "@/hooks/use-project"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { askQuestion } from "@/lib/actions/ask.actions"
import { readStreamableValue } from "ai/rsc"
import CodeReferences from './code-refernces';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';

const AskQuestion = () => {
    const [question, setQuestion] = useState("")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false);
    const [fileReferences, setFileReferences] = useState<{ fileName: string; sourceCode: string; summary: string }[]>([])
    const [answers, setAnswers] = useState('');

    const { project } = useProjects()

    const saveAnswer=api.project.saveAnswer.useMutation()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswers(' ')
        setFileReferences([])
        e.preventDefault()
        if (!project?.id) return
        setLoading(true)

        const { output, fileReferences } = await askQuestion(question, project.id)
        setOpen(true)
        setFileReferences(fileReferences)

        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswers(ans => ans + delta)
            }
        }

        setLoading(false)
    }
    const refetch=useRefetch()

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-[80vw]'>
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                        <DialogTitle>
                            <Image src="/logo.png" alt="image" width={40} height={40} />
                        </DialogTitle>
                        <Button  disabled={saveAnswer.isPending} variant={'outline'} onClick={()=>{
                            saveAnswer.mutate({
                                projectId:project!.id,
                                question,
                                answer:answers,
                                fileReferences
                            },{
                                onSuccess:()=>{
                                    toast.success('Answer Saved!');
                                    refetch();
                                },
                                onError:()=>{
                                        toast.error('Failed to save answer!')
                                }
                            })
                        }}>
                            Save Answer
                        </Button>
                        </div>
                    </DialogHeader>
                    <MDEditor.Markdown source={answers} className='max-w-[70vw] !h-full max-h-[40vh] overflow-scroll'/>
                    <div className="h-4"></div>
                    <CodeReferences fileReferences={fileReferences}/>

                    <Button type='button' onClick={()=>setOpen(false)}>
                        Close
                    </Button>
                </DialogContent>
            </Dialog>
            <Card className="relative col-span-3">
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder="Ask a question" />
                        <div className="h-4"></div>
                        <Button type="submit" disabled={loading}>
                            Ask RepoX! 🚀
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestion