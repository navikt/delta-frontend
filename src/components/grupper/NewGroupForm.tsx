"use client"
import { useState } from 'react';
import { Button, TextField, Select, Switch, Textarea } from '@navikt/ds-react';
import { useRouter } from 'next/navigation';

export default function NewGroupForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        announcement: '',
        description: '',
        group_type: 'faggruppe',
        is_regular_meeting: false,
        meeting_frequency: '',
        default_meeting_start: '',
        default_meeting_end: '',
        has_private_slack: false,
        slack_channel_name: '',
        slack_channel_url: '',
        is_active: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Create a new object without meeting fields if is_regular_meeting is false
            const submitData = {
                ...formData,
                ...(formData.is_regular_meeting ? {} : {
                    meeting_frequency: null,
                    default_meeting_start: null,
                    default_meeting_end: null
                })
            };

            console.log('Submitting form data:', JSON.stringify(submitData, null, 2));
            const response = await fetch('/api/opprettfaggruppe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            const responseData = await response.json();
            console.log('Response:', response.status, responseData);

            if (!response.ok) {
                throw new Error(`Failed to create group: ${JSON.stringify(responseData)}`);
            }

            // Redirect to the newly created group's page
            router.push(`/grupper/${responseData.group_id}`);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <TextField 
                label="Gruppenavn"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            
            {/* Temporarily commented out announcement field
            <Textarea 
                label="Kunngjøring"
                value={formData.announcement}
                onChange={(e) => setFormData({...formData, announcement: e.target.value})}
            />
            */}
            
            <Textarea 
                label="Beskrivelse"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            
            <Select 
                label="Gruppetype"
                value={formData.group_type}
                onChange={(e) => setFormData({...formData, group_type: e.target.value})}
            >
                <option value="faggruppe">Faggruppe</option>
                <option value="møteplass">Møteplass</option>
                <option value="bedriftidrettslag">Bedriftidrettslag</option>
                <option value="annet">Annet</option>
            </Select>

            <Switch 
                checked={formData.is_regular_meeting}
                onChange={(e) => setFormData({
                    ...formData, 
                    is_regular_meeting: e.target.checked,
                    meeting_frequency: e.target.checked ? 'Hver fagtorsdag' : ''
                })}
            >
                Regelmessige møter
            </Switch>
            
            {formData.is_regular_meeting && (
                <>
                    <Select 
                        label="Møtefrekvens"
                        value={formData.meeting_frequency}
                        onChange={(e) => setFormData({...formData, meeting_frequency: e.target.value})}
                    >
                        <option value="Hver fagtorsdag">Hver fagtorsdag</option>
                        <option value="Annenhver uke">Annenhver uke</option>
                        <option value="Månedlig">Månedlig</option>
                    </Select>
                    
                    <div className="flex gap-4">
                        <TextField 
                            label="Møtestart"
                            type="time"
                            value={formData.default_meeting_start}
                            onChange={(e) => setFormData({...formData, default_meeting_start: e.target.value})}
                        />
                        
                        <TextField 
                            label="Møteslutt"
                            type="time"
                            value={formData.default_meeting_end}
                            onChange={(e) => setFormData({...formData, default_meeting_end: e.target.value})}
                        />
                    </div>
                </>
            )}

            <Switch 
                checked={formData.has_private_slack}
                onChange={(e) => setFormData({...formData, has_private_slack: e.target.checked})}
            >
                Åpen Slack eller Teams-kanal
            </Switch>
            
            {formData.has_private_slack && (
                <>
                    <TextField 
                        label="Kanalnavn"
                        value={formData.slack_channel_name}
                        onChange={(e) => setFormData({...formData, slack_channel_name: e.target.value})}
                    />
                    
                    <TextField 
                        label="URL til kanal"
                        value={formData.slack_channel_url}
                        onChange={(e) => setFormData({...formData, slack_channel_url: e.target.value})}
                    />
                </>
            )}

{/* 
            <Switch 
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            >
                Aktiv gruppe
            </Switch>
*/}
            
            <Button variant="primary" type="submit" loading={loading}>
                Opprett gruppe
            </Button>
        </form>
    );
}
