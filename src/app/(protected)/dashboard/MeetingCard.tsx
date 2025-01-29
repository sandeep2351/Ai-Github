'use client';

import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Card } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "@/lib/cloudinary"; // Adjusted to use the Cloudinary file
import { Button } from "@/components/ui/button";
import { Presentation, Upload } from "lucide-react";
import { api } from "@/trpc/react";
import { useProjects } from "@/hooks/use-project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";  // Import useRouter directly here
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
    const { project } = useProjects();
    const processMeeting = useMutation({
      mutationFn: async (data: { meetingUrl: string, meetingId: string, projectId: string }) => {
        const { meetingUrl, meetingId, projectId } = data;
        const response = await axios.post('/api/process-meeting', { meetingUrl, meetingId, projectId });
        return response.data;
      }
    });

    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const uploadMeeting = api.project.uploadMeeting.useMutation();
    
    const router = useRouter();
    

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            "audio/*": [".mp3", ".wav", ".m4a"],
        },
        multiple: false,
        maxSize: 50_000_000, // 50MB max size
        onDrop: async (acceptedFiles) => {
            if (!project) return;

            if (!acceptedFiles || acceptedFiles.length === 0) return;
            setIsUploading(true);

            try {
                const file = acceptedFiles[0];
                if (!file) return;
                const downloadUrl = await uploadFile(file as File, setProgress) as string;
                uploadMeeting.mutate({
                    projectId: project.id,
                    meetingUrl: downloadUrl,
                    name: file.name
                }, {
                    onSuccess: (meeting) => {
                        toast.success("Meeting Uploaded Successfully");
                        if (router) {
                          router.push("/meetings");  // Safe to use router.push() now
                        }
                        processMeeting.mutateAsync({ meetingUrl: downloadUrl, meetingId: meeting.id, projectId: project.id });
                    },
                    onError: () => {
                        toast.error('Failed to Upload Meeting');
                    }
                });
            } catch (error) {
                console.error("Error uploading file:", error);
                window.alert("Failed to upload file. Please try again.");
            } finally {
                setIsUploading(false);
            }
        },
    });
   

    return (
        <Card
            className="col-span-2 flex flex-col items-center justify-center p-10"
            {...getRootProps()}
        >
            {isUploading ? (
                <>
                    <Presentation className="h-10 w-10 animate-bounce" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        Create a new meeting
                    </h3>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Analyse your meeting with devSpace.
                        <br />
                        Powered by AI.
                    </p>
                    <div className="mt-6">
                        <Button disabled={isUploading}>
                            <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Upload Meeting
                        </Button>
                    </div>
                    <div className="mt-4">
                        <CircularProgressbar
                            value={progress}
                            text={`${progress}%`}
                            className="w-20 h-20 mx-auto"
                            styles={buildStyles({
                                pathColor: "#2563eb",
                                textColor: "#2563eb",
                            })}
                        />
                        <p className="text-sm text-gray-500 text-center">
                            Uploading your meeting...
                        </p>
                    </div>
                </>
            ) : (
              <>
              <Presentation className="h-10 w-10 animate-bounce" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        Create a new meeting
                    </h3>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Analyse your meeting with devSpace.
                        <br />
                        Powered by AI.
                    </p>
                    <div className="mt-2">
                        <Button disabled={isUploading}>
                            <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Upload Meeting
                        </Button>
                    </div>
              </>
            )} 

            {/* Hidden input for the dropzone */}
            <input className="hidden" {...getInputProps()} />
        </Card>
    );
};

export default MeetingCard;
