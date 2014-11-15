using System.Collections.ObjectModel;
using System.Net.Http;
using System.Threading.Tasks;
using GalaSoft.MvvmLight;
using Newtonsoft.Json;
using TransparentBudgetWP8.Models;

namespace TransparentBudgetWP8.ViewModel
{
    /// <summary>
    /// This class contains properties that the main View can data bind to.
    /// <para>
    /// Use the <strong>mvvminpc</strong> snippet to add bindable properties to this ViewModel.
    /// </para>
    /// <para>
    /// You can also use Blend to data bind with the tool's support.
    /// </para>
    /// <para>
    /// See http://www.galasoft.ch/mvvm
    /// </para>
    /// </summary>
    public class MainViewModel : ViewModelBase 
    {
        /// <summary>
        /// Initializes a new instance of the MainViewModel class.
        /// </summary>
        public MainViewModel()
        {
            ////if (IsInDesignMode)
            ////{
            ////    // Code runs in Blend --> create design time data.
            ////}
            ////else
            ////{
            ////    // Code runs "for real"
            ////}
        }

        private ObservableCollection<PlaceItem> _items = new ObservableCollection<PlaceItem>();
        /// <summary>
        /// Items
        /// </summary>
        public ObservableCollection<PlaceItem> Items
        {
            get { return _items; }
            set
            {
                _items = value;
                RaisePropertyChanged("Items");
            }
        }

        /// <summary>
        /// Load places from transparentbudget service
        /// </summary>
        /// <returns></returns>
        public async Task LoadPlaces()
        {
            HttpClient client = new HttpClient();
            string placesString = await client.GetStringAsync("http://transparentbudget.azurewebsites.net/api/places");
            Items = JsonConvert.DeserializeObject<ObservableCollection<PlaceItem>>(placesString);
            return;
        }
        
    }
}