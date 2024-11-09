import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Folder, Check, X } from 'lucide-react';
import RunDetails from '../components/RunDetails';
import { useTheme } from '../components/ui/theme-provider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { useDispatch, useSelector } from 'react-redux';
import { deleteRunsForPlatform } from '../state/actions';
import { setCurrentRoute, updateBreadcrumb } from '../state/actions';
import { formatLastRunTime } from '../helpers';


const Platform = ({ platform }) => {
  const runs = useSelector(state => state.app.runs)
    .filter(run => run.platformId === platform.id)
    .sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateB - dateA;
    });

  const [selectedRun, setSelectedRun] = useState(null);
  const dispatch = useDispatch();


  const handleDeleteAllData = async () => {
    try {
      dispatch(deleteRunsForPlatform(platform.id));
      setRuns([]);
    } catch (error) {
      console.error('Error deleting platform data:', error);
    }
  };

  const onViewRunDetails = (run) => {
    setSelectedRun({ run, platform });
  };

  const handleCloseDetails = () => {
    setSelectedRun(null);
  };

  return (
    <div className="space-y-8 px-[50px] pt-6">
          <div className="flex justify-between items-center">
            <CardTitle>{platform.name} History</CardTitle>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => window.electron.ipcRenderer.send('open-platform-export-folder', platform.company, platform.name)}
              className="flex items-center"
            >
              <Folder size={16} className="mr-2" />
              Open Export Folder
            </Button> */}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Result</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => {
                return (
                  <React.Fragment key={run.id}>
                    <TableRow 
                      className="cursor-pointer"
                      onClick={() => onViewRunDetails(run)}
                    >
                      <TableCell className="font-medium">
                        {run.status === 'success' ? <Check className="text-green-500" size={16} /> : <X className="text-red-500" size={16} />}
                      </TableCell>
                      <TableCell>
                        {formatLastRunTime(run.endDate)}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete All Platform Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all data associated with {platform.name}, including all runs and extracted information.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllData}>
                  Yes, delete all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {selectedRun && (
        <RunDetails
          runId={selectedRun.run.id}
          onClose={handleCloseDetails}
          platform={platform}
        />
      )}
    </div>
  );
};

export default Platform;
