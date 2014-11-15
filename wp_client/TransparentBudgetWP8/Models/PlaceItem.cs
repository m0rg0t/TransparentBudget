using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GalaSoft.MvvmLight;

namespace TransparentBudgetWP8.Models
{
    public class PlaceItem: ViewModelBase
    {
        private string _title;
        /// <summary>
        /// 
        /// </summary>
        public string Title
        {
            get { return _title; }
            set { _title = value; }
        }

        private string _description;
        /// <summary>
        /// 
        /// </summary>
        public string Description
        {
            get { return _description; }
            set
            {
                _description = HtmlRemoval.StripTagsRegex(value);
                RaisePropertyChanged("Description");
                RaisePropertyChanged("ShortDescription");
            }
        }

        private string _shortDescription;

        public string ShortDescription
        {
            get
            {
                try
                {
                    return Description.Substring(0, 255) + "...";
                }
                catch
                {
                    return Description;
                }
            }
            private set { _shortDescription = value; }
        }
        

        private string _author;
        /// <summary>
        /// 
        /// </summary>
        public string Author
        {
            get { return _author; }
            set { _author = value; }
        }

        private double _lat;
        /// <summary>
        /// 
        /// </summary>
        public double Lat
        {
            get { return _lat; }
            set { _lat = value; }
        }

        private double _lon;
        /// <summary>
        /// 
        /// </summary>
        public double Lon
        {
            get { return _lon; }
            set { _lon = value; }
        }

        private string __id;

        public string _id
        {
            get { return __id; }
            set { __id = value; }
        }

        private string _address;

        public string Address
        {
            get { return _address; }
            set { _address = value; }
        }
        
        
        
    }
}
